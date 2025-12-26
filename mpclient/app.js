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

async function exchangeCodeForToken({ code, codeVerifier }) {
  const body = toFormBody({
    grant_type: 'authorization_code',
    client_id: MEDPLUM_CLIENT_ID,
    code,
    redirect_uri: MEDPLUM_REDIRECT_URL,
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: basicAuthHeader(MEDPLUM_CLIENT_ID, MEDPLUM_CLIENT_SECRET),
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

async function refreshToken(refreshTokenValue) {
  const body = toFormBody({
    grant_type: 'refresh_token',
    client_id: MEDPLUM_CLIENT_ID,
    refresh_token: refreshTokenValue,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: basicAuthHeader(MEDPLUM_CLIENT_ID, MEDPLUM_CLIENT_SECRET),
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
  if (!req.session || !req.session.token) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Not authenticated. Visit /auth/login in a browser first.',
    });
  }
  return next();
}

async function ensureFreshAccessToken(req) {
  const token = req.session.token;
  if (!token) {
    throw new Error('No token in session');
  }

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

  const refreshed = await refreshToken(token.refresh_token);

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

app.get('/auth/login', (req, res) => {
  // PKCE
  const codeVerifier = randomString(32);
  const codeChallenge = sha256Base64Url(codeVerifier);

  // CSRF protection
  const state = randomString(16);

  req.session.pkce = { codeVerifier, state };

  // Request offline_access so we can refresh tokens.
  const scope = 'openid offline_access';

  const authorizeUrl = new URL(AUTHORIZE_URL);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', MEDPLUM_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', MEDPLUM_REDIRECT_URL);
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);

  res.redirect(authorizeUrl.toString());
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
        )}</pre><p><a href="/auth/login">Try again</a></p>`
      );
  }

  // If no code, show a simple home page.
  if (!code) {
    const isAuthed = Boolean(req.session.token);
    return res.send(`
      <h1>mpclient</h1>
      <p>Status: ${isAuthed ? 'Authenticated' : 'Not authenticated'}</p>
      <ul>
        <li><a href="/auth/login">Login with Medplum</a></li>
        <li><a href="/auth/logout">Logout</a></li>
      </ul>
      <p>FHIR proxy endpoint: <code>/fhir/R4/*</code></p>
    `);
  }

  if (!req.session.pkce) {
    return res
      .status(400)
      .send('<h1>Missing PKCE session</h1><p>Start at <a href="/auth/login">/auth/login</a></p>');
  }

  if (state !== req.session.pkce.state) {
    return res.status(400).send('<h1>Invalid state</h1><p>CSRF check failed.</p>');
  }

  try {
    const tokenResponse = await exchangeCodeForToken({
      code: String(code),
      codeVerifier: req.session.pkce.codeVerifier,
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
        `<h1>Token exchange failed</h1><p>${message}</p><pre>${String(details)}</pre><p><a href="/auth/login">Try again</a></p>`
      );
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
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

      const base = MEDPLUM_FHIR_BASE_URL.replace(/\/$/, '');
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
      res.send(buf);
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
