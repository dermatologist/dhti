/*
 * mpclient - minimal Medplum OAuth2 (Auth Code + PKCE) + FHIR proxy
 *
 * What this does:
 * - GET /auth/login: starts OAuth2 authorization code flow with PKCE.
 * - GET / (redirect URI): handles the OAuth2 callback (code -> tokens).
 * - Proxies any request at /fhir/R4/* to the Medplum FHIR server, attaching Bearer token.
 * - Refreshes access tokens using refresh_token when needed.
 *
 * Env vars (all optional; defaults match the prompt):
 * - PORT: listening port (default 8111)
 * - MPCLIENT_BASE_URL: external base URL of this app (default http://localhost:8111)
 * - MEDPLUM_ISSUER_URL: Medplum base URL (default http://localhost:8103)
 * - MEDPLUM_FHIR_BASE_URL: FHIR base URL (default http://localhost:8103/fhir/R4)
 * - MEDPLUM_CLIENT_ID: OAuth client id
 * - MEDPLUM_CLIENT_SECRET: OAuth client secret
 * - MEDPLUM_REDIRECT_URL: redirect URI registered in Medplum (default http://localhost:8111)
 * - SESSION_SECRET: session cookie secret (default dev-only value)
 */

const crypto = require('node:crypto');
const express = require('express');
const session = require('express-session');

const PORT = Number.parseInt(process.env.PORT || '8111', 10);

const MPCLIENT_BASE_URL = process.env.MPCLIENT_BASE_URL || `http://localhost:${PORT}`;

// Medplum endpoints
const MEDPLUM_ISSUER_URL = process.env.MEDPLUM_ISSUER_URL || 'http://localhost:8103';
const AUTHORIZE_URL = `${MEDPLUM_ISSUER_URL.replace(/\/$/, '')}/oauth2/authorize`;
const TOKEN_URL = `${MEDPLUM_ISSUER_URL.replace(/\/$/, '')}/oauth2/token`;

// FHIR proxy target
const MEDPLUM_FHIR_BASE_URL = process.env.MEDPLUM_FHIR_BASE_URL || 'http://localhost:8103/fhir/R4';

// OAuth client settings
const MEDPLUM_CLIENT_ID =
  process.env.MEDPLUM_CLIENT_ID || '9d49ca0f-16e1-4c85-9f35-e4ad4d695023';
const MEDPLUM_CLIENT_SECRET =
  process.env.MEDPLUM_CLIENT_SECRET ||
  'e0e1868b887f2cad871a121035a0acf1579823e840b3e7d357bc85d10e726248';

// Prompt states redirect URL is exactly http://localhost:8111
const MEDPLUM_REDIRECT_URL = process.env.MEDPLUM_REDIRECT_URL || MPCLIENT_BASE_URL;

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-change-me';

function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function sha256Base64Url(input) {
  const hash = crypto.createHash('sha256').update(input).digest();
  return base64UrlEncode(hash);
}

function randomString(bytes = 32) {
  return base64UrlEncode(crypto.randomBytes(bytes));
}

function toFormBody(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      sp.set(k, String(v));
    }
  }
  return sp.toString();
}

function basicAuthHeader(clientId, clientSecret) {
  const token = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

function getNowSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function exchangeCodeForToken({ code, codeVerifier, config }) {
  const clientId = config.clientId || MEDPLUM_CLIENT_ID;
  const clientSecret = config.clientSecret || MEDPLUM_CLIENT_SECRET;
  const tokenUrl = `${(config.issuerUrl || MEDPLUM_ISSUER_URL).replace(/\/$/, '')}/oauth2/token`;
  const redirectUrl = config.redirectUrl || MEDPLUM_REDIRECT_URL;

  const body = toFormBody({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: redirectUrl,
    code_verifier: codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: basicAuthHeader(clientId, clientSecret),
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`Token exchange failed (${res.status})`);
    err.details = text;
    throw err;
  }

  return JSON.parse(text);
}

async function refreshToken(refreshTokenValue, config) {
  const clientId = config.clientId || MEDPLUM_CLIENT_ID;
  const clientSecret = config.clientSecret || MEDPLUM_CLIENT_SECRET;
  const tokenUrl = `${(config.issuerUrl || MEDPLUM_ISSUER_URL).replace(/\/$/, '')}/oauth2/token`;

  const body = toFormBody({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshTokenValue,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: basicAuthHeader(clientId, clientSecret),
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`Token refresh failed (${res.status})`);
    err.details = text;
    throw err;
  }

  return JSON.parse(text);
}

function ensureAuthenticated(req, res, next) {
  // Check session-based auth (browser)
  if (req.session && req.session.token) {
    return next();
  }

  // Check Bearer token in Authorization header (CLI/API)
  const authHeader = req.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    // Store the raw token in a temporary session-like object for this request
    req.session = req.session || {};
    req.session.token = {
      access_token: token,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // Assume valid for 1 hour
    };
    return next();
  }

  return res.status(401).json({
    error: 'unauthorized',
    message:
      'Not authenticated. Either: (1) visit /auth/login in a browser, or (2) send `Authorization: Bearer <access_token>` header.',
  });
}

async function ensureFreshAccessToken(req) {
  const token = req.session.token;
  if (!token) {
    throw new Error('No token in session');
  }

  const config = req.session.config || {};

  // token.expires_at is unix seconds
  const now = getNowSeconds();
  const expiresAt = token.expires_at || 0;

  // Refresh if token expires within 60 seconds
  if (expiresAt - now > 60) {
    return token.access_token;
  }

  if (!token.refresh_token) {
    throw new Error('Access token expired and no refresh_token available');
  }

  const refreshed = await refreshToken(token.refresh_token, config);

  // Preserve refresh_token if refresh response does not include a new one
  const nextRefreshToken = refreshed.refresh_token || token.refresh_token;

  req.session.token = {
    ...refreshed,
    refresh_token: nextRefreshToken,
    expires_at: now + Number(refreshed.expires_in || 3600),
  };

  return req.session.token.access_token;
}

const app = express();

app.set('trust proxy', 1);

app.use(
  session({
    name: 'mpclient.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // OK for localhost; set true behind HTTPS
    },
  })
);

// Parse form data
app.use(express.urlencoded({ extended: false }));

app.get('/auth/login', (req, res) => {
  // Use config from session if available, else use env vars or defaults
  const issuerUrl = req.session.config?.issuerUrl || process.env.MEDPLUM_ISSUER_URL || 'http://localhost:8103';
  const clientId = req.session.config?.clientId || process.env.MEDPLUM_CLIENT_ID || '9d49ca0f-16e1-4c85-9f35-e4ad4d695023';
  const redirectUrl = req.session.config?.redirectUrl || process.env.MEDPLUM_REDIRECT_URL || MPCLIENT_BASE_URL;

  const authorizeUrl = `${issuerUrl.replace(/\/$/, '')}/oauth2/authorize`;

  // PKCE
  const codeVerifier = randomString(32);
  const codeChallenge = sha256Base64Url(codeVerifier);

  // CSRF protection
  const state = randomString(16);

  req.session.pkce = { codeVerifier, state };

  // Request offline_access so we can refresh tokens.
  const scope = 'openid offline_access';

  const url = new URL(authorizeUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUrl);
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('code_challenge', codeChallenge);

  res.redirect(url.toString());
});

// Handle form submission from home page
app.post('/auth/login', (req, res) => {
  const { issuerUrl, fhirBaseUrl, clientId, clientSecret, redirectUrl } = req.body;

  // Validate inputs
  if (!issuerUrl || !fhirBaseUrl || !clientId || !clientSecret || !redirectUrl) {
    return res.status(400).send('<h1>Missing required fields</h1><p><a href="/">Go back</a></p>');
  }

  // Store config in session for use during token exchange and proxy
  req.session.config = {
    issuerUrl,
    fhirBaseUrl,
    clientId,
    clientSecret,
    redirectUrl,
  };

  // Redirect to GET /auth/login which will use the session config
  res.redirect('/auth/login');
});

// Redirect URI handler. Prompt states redirect URL is http://localhost:8111
app.get('/', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res
      .status(400)
      .send(
        `<h1>Authentication error</h1><p>${String(error)}</p><pre>${String(
          error_description || ''
        )}</pre><p><a href="/">Try again</a></p>`
      );
  }

  // If no code, show configuration form or home page.
  if (!code) {
    const isAuthed = Boolean(req.session.token);
    const defaultIssuerUrl = req.session.config?.issuerUrl || process.env.MEDPLUM_ISSUER_URL || 'http://localhost:8103';
    const defaultFhirUrl = req.session.config?.fhirBaseUrl || process.env.MEDPLUM_FHIR_BASE_URL || 'http://localhost:8103/fhir/R4';
    const defaultClientId = req.session.config?.clientId || process.env.MEDPLUM_CLIENT_ID || '9d49ca0f-16e1-4c85-9f35-e4ad4d695023';
    const defaultClientSecret = req.session.config?.clientSecret || process.env.MEDPLUM_CLIENT_SECRET || 'e0e1868b887f2cad871a121035a0acf1579823e840b3e7d357bc85d10e726248';
    const defaultRedirectUrl = req.session.config?.redirectUrl || process.env.MEDPLUM_REDIRECT_URL || MPCLIENT_BASE_URL;

    return res.send(`
      <html>
      <head>
        <title>mpclient</title>
        <style>
          body { font-family: sans-serif; margin: 20px; max-width: 600px; }
          form { border: 1px solid #ccc; padding: 20px; border-radius: 5px; }
          label { display: block; margin-top: 10px; font-weight: bold; }
          input { width: 100%; padding: 5px; margin-top: 5px; box-sizing: border-box; }
          button { margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; }
          button:hover { background: #0056b3; }
          .status { padding: 10px; margin-bottom: 20px; border-radius: 3px; }
          .status.authenticated { background: #d4edda; color: #155724; }
          .status.unauthenticated { background: #f8d7da; color: #721c24; }
          hr { margin: 30px 0; }
        </style>
      </head>
      <body>
        <h1>mpclient</h1>
        <div class="status ${isAuthed ? 'authenticated' : 'unauthenticated'}">
          Status: ${isAuthed ? '✓ Authenticated' : '✗ Not authenticated'}
        </div>

        ${isAuthed ? `
          <h2>Authenticated</h2>
          <ul>
            <li><a href="/auth/token">Get your access token</a></li>
            <li><a href="/auth/logout">Logout</a></li>
          </ul>
          <p>FHIR proxy endpoint: <code>/fhir/R4/*</code></p>
          <p>Use with curl: <code>curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8111/fhir/R4/...</code></p>
        ` : `
          <h2>Configure Medplum OAuth</h2>
          <form method="POST" action="/auth/login">
            <label for="issuerUrl">Medplum Issuer URL:</label>
            <input type="text" id="issuerUrl" name="issuerUrl" value="${defaultIssuerUrl}" required />

            <label for="fhirBaseUrl">FHIR Base URL:</label>
            <input type="text" id="fhirBaseUrl" name="fhirBaseUrl" value="${defaultFhirUrl}" required />

            <label for="clientId">Client ID:</label>
            <input type="text" id="clientId" name="clientId" value="${defaultClientId}" required />

            <label for="clientSecret">Client Secret:</label>
            <input type="password" id="clientSecret" name="clientSecret" value="${defaultClientSecret}" required />

            <label for="redirectUrl">Redirect URL:</label>
            <input type="text" id="redirectUrl" name="redirectUrl" value="${defaultRedirectUrl}" required />

            <button type="submit">Login with Medplum</button>
          </form>
        `}

        <hr />
        <h3>Command Line / API</h3>
        <ol>
          <li>Configure and authenticate using the form above</li>
          <li>Then <a href="/auth/token">get your access token</a></li>
          <li>Use it: <code>curl -H "Authorization: Bearer TOKEN" http://localhost:8111/fhir/R4/...</code></li>
        </ol>
      </body>
      </html>
    `);
  }

  if (!req.session.pkce) {
    return res
      .status(400)
      .send('<h1>Missing PKCE session</h1><p>Start at <a href="/">home</a></p>');
  }

  if (state !== req.session.pkce.state) {
    return res.status(400).send('<h1>Invalid state</h1><p>CSRF check failed.</p>');
  }

  try {
    const tokenResponse = await exchangeCodeForToken({
      code: String(code),
      codeVerifier: req.session.pkce.codeVerifier,
      config: req.session.config || {},
    });

    const now = getNowSeconds();
    req.session.token = {
      ...tokenResponse,
      expires_at: now + Number(tokenResponse.expires_in || 3600),
    };

    // Clear one-time PKCE fields
    req.session.pkce = null;

    return res.redirect('/');
  } catch (e) {
    const message = e && e.message ? e.message : 'Unknown error';
    const details = e && e.details ? e.details : '';
    return res
      .status(500)
      .send(
        `<h1>Token exchange failed</h1><p>${message}</p><pre>${String(details)}</pre><p><a href="/">Try again</a></p>`
      );
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Get current access token (for CLI use)
app.get('/auth/token', ensureAuthenticated, async (req, res) => {
  try {
    const accessToken = await ensureFreshAccessToken(req);
    res.json({
      access_token: accessToken,
      message: 'Use this token with: curl -H "Authorization: Bearer <token>" http://localhost:8111/fhir/R4/...',
    });
  } catch (e) {
    res.status(401).json({
      error: 'token_error',
      message: e && e.message ? e.message : 'Failed to get token',
    });
  }
});

// Proxy all FHIR requests to Medplum, attaching bearer token.
// We intentionally use raw body so we can forward arbitrary content-types (JSON, XML, NDJSON, etc).
app.use(
  '/fhir/R4',
  ensureAuthenticated,
  express.raw({ type: '*/*', limit: '10mb' }),
  async (req, res) => {
    try {
      const accessToken = await ensureFreshAccessToken(req);
      const fhirBaseUrl = req.session.config?.fhirBaseUrl || MEDPLUM_FHIR_BASE_URL;

      const base = fhirBaseUrl.replace(/\/$/, '');
      const targetUrl = new URL(base + req.originalUrl.replace(/^\/fhir\/R4/, ''));

      // Preserve query string
      const orig = new URL(MPCLIENT_BASE_URL + req.originalUrl);
      targetUrl.search = orig.search;

      // Copy headers but override Authorization and Host
      const headers = { ...req.headers };
      delete headers.host;
      delete headers['content-length'];

      headers.authorization = `Bearer ${accessToken}`;

      const upstream = await fetch(targetUrl.toString(), {
        method: req.method,
        headers,
        body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
      });

      // Relay status and headers
      res.status(upstream.status);
      upstream.headers.forEach((value, key) => {
        // Avoid setting hop-by-hop headers
        if (key.toLowerCase() === 'transfer-encoding') return;
        res.setHeader(key, value);
      });

      const buf = Buffer.from(await upstream.arrayBuffer());
      // Use res.end() for raw buffers (res.send() may not handle raw data correctly with express.raw middleware)
      res.end(buf);
    } catch (e) {
      const message = e && e.message ? e.message : 'Unknown error';
      res.status(502).json({ error: 'bad_gateway', message });
    }
  }
);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`mpclient listening on ${MPCLIENT_BASE_URL}`);
  // eslint-disable-next-line no-console
  console.log(`Authorize URL: ${AUTHORIZE_URL}`);
  // eslint-disable-next-line no-console
  console.log(`FHIR proxy: http://localhost:${PORT}/fhir/R4/* -> ${MEDPLUM_FHIR_BASE_URL}/*`);
});
