
# Medplum Integration Documentation

## Overview

Medplum is a comprehensive FHIR-compliant healthcare data platform that provides secure data management, access control, and interoperability capabilities. The DHTI integration includes:

- **Medplum Server**: FHIR-compliant healthcare data backend
- **Medplum App**: Web-based user interface for data management
- **mpclient**: OAuth2 proxy for FHIR API access with token management
- **Supporting Services**: PostgreSQL database and Redis cache

## Quick Start

### Adding Medplum to Your Environment

```bash
dhti-cli compose add -m medplum
dhti-cli docker -u
```

This will add and configure all Medplum services with their dependencies.

## Services and Ports

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **medplum-server** | 8103 | `http://localhost:8103/` | FHIR API server, OAuth2 endpoints, admin API |
| **medplum-app** | 3103 | `http://localhost:3103/` | Web UI for data management and administration |
| **mpclient** | 8111 | `http://localhost:8111/` | OAuth2 proxy for FHIR API access with token management |
| **postgres-db** | 5432 | (internal) | Primary database for Medplum data |
| **redis** | 6379 | (internal) | Caching and session management |


* Create an account at `http://localhost:3103/` to access the Medplum App.
* Create a project
* Add an client application to obtain `MEDPLUM_CLIENT_ID` and `MEDPLUM_CLIENT_SECRET` for mpclient configuration.
* Update mpclient configuration  ~/dhti/docker-compose.yml` and set the client ID and secret. Restart the mpclient service.
* Login at `http://localhost:8111/` using the "Login with Medplum" button to authenticate via OAuth2.
* proxy FHIR API requests through mpclient at `http://localhost:8111/fhir/R4/`


## Service Descriptions

### Medplum Server (Port 8103)

The core backend service providing:

- **FHIR R4 API**: Full FHIR R4 resource management
- **OAuth2 Server**: Authentication and authorization
- **RESTful Endpoints**:
  - `/fhir/R4/*` - FHIR resource operations
  - `/oauth2/authorize` - OAuth2 authorization endpoint
  - `/oauth2/token` - Token exchange endpoint
  - `/healthcheck` - Service health status

**Key Configuration**:
```yaml
MEDPLUM_PORT: 8103
MEDPLUM_BASE_URL: 'http://localhost:8103/'
MEDPLUM_DATABASE_HOST: 'postgres-db'
MEDPLUM_REDIS_HOST: 'redis'
MEDPLUM_ALLOWED_ORIGINS: '*'
MEDPLUM_INTROSPECTION_ENABLED: 'true'
```

### Medplum App (Port 3103)

Web-based user interface for:

- Patient and provider management
- FHIR resource visualization and editing
- Administration and configuration
- Care coordination workflows

Access at: `http://localhost:3103/`

### mpclient (Port 8111)

OAuth2-enabled FHIR proxy providing:

- **OAuth2 Auth Code Flow with PKCE**: Secure token-based authentication
- **Token Management**: Automatic token refresh and lifecycle management
- **FHIR Proxy**: Forward requests to Medplum server with authentication
- **Session Management**: Browser-based and Bearer token support

**Key Features**:
- Gzip decompression for transparent proxy operation
- Configurable OAuth2 endpoints and credentials
- Support for both browser sessions and API clients
- PKCE (Proof Key for Code Exchange) for enhanced security

## Configuration

### Environment Variables

Set these before `docker compose up` to customize Medplum:

```bash
# OAuth2 Client Credentials (required)
MEDPLUM_CLIENT_ID="your-client-id"
MEDPLUM_CLIENT_SECRET="your-client-secret"

# Medplum Server Configuration
MEDPLUM_BASE_URL="http://localhost:8103/"
MEDPLUM_APP_BASE_URL="http://localhost:3103/"

# Database Configuration
MEDPLUM_DATABASE_HOST="postgres-db"
MEDPLUM_DATABASE_PORT=5432
MEDPLUM_DATABASE_DBNAME="postgres"
MEDPLUM_DATABASE_USERNAME="postgres"
MEDPLUM_DATABASE_PASSWORD="postgres"

# Redis Configuration
MEDPLUM_REDIS_HOST="redis"
MEDPLUM_REDIS_PORT=6379

# CORS and Security
MEDPLUM_ALLOWED_ORIGINS="*"
MEDPLUM_INTROSPECTION_ENABLED="true"
```

### mpclient Configuration

Configure mpclient via web form at `http://localhost:8111/` or environment variables:

```bash
MEDPLUM_TOKEN_URL="http://medplum-server:8103/oauth2/token"
MEDPLUM_CLIENT_ID="your-client-id"
MEDPLUM_CLIENT_SECRET="your-client-secret"
MEDPLUM_FHIR_BASE_URL="http://medplum-server:8103/fhir/R4"
```

## Usage Workflows

### 1. Web-Based Workflow

1. **Access the Web UI**: Open `http://localhost:3103/`
2. **Login/Register**: Create or use existing credentials
3. **Manage Data**: Create, read, update, delete FHIR resources through the UI
4. **Manage Configuration**: Configure OAuth2 clients, user access, etc.

### 2. API Client Workflow

1. **Authenticate with mpclient**:
   ```bash
   # Get access token
   curl http://localhost:8111/auth/token \
     -H "Authorization: Bearer <your-token>"
   ```

2. **Use the FHIR Proxy**:
   ```bash
   curl -H "Authorization: Bearer <access-token>" \
     http://localhost:8111/fhir/R4/Patient
   ```

3. **Create Resources**:
   ```bash
   curl -X POST http://localhost:8111/fhir/R4/Patient \
     -H "Authorization: Bearer <access-token>" \
     -H "Content-Type: application/fhir+json" \
     -d @patient.json
   ```

### 3. OAuth2 Authentication Flow (via mpclient)

mpclient implements OAuth2 Authorization Code Flow with PKCE:

1. **Browser Access**: Visit `http://localhost:8111/`
2. **Authentication**: Click "Login with Medplum"
3. **Authorization**: Approve access scopes
4. **Token Exchange**: mpclient exchanges code for access/refresh tokens
5. **Token Management**: Automatic refresh when tokens expire
6. **API Access**: Use bearer tokens for FHIR API calls

## FHIR API Examples

### Query Patients
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8111/fhir/R4/Patient
```

### Create a Patient
```bash
curl -X POST http://localhost:8111/fhir/R4/Patient \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Patient",
    "name": [{"given": ["John"], "family": "Doe"}],
    "birthDate": "1990-01-01"
  }'
```

### Search with Parameters
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8111/fhir/R4/Patient?name=Doe&birthdate=1990"
```

### Get Observation Data
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8111/fhir/R4/Observation?patient=<patient-id>
```

## Security Considerations

1. **OAuth2 PKCE**: Protects against authorization code interception attacks
2. **Token Expiration**: Access tokens automatically refresh
3. **CORS Configuration**: Set `MEDPLUM_ALLOWED_ORIGINS` appropriately for production
4. **Database Security**: Use strong passwords for postgres-db
5. **Redis**: Run on internal network (not exposed publicly)
6. **HTTPS in Production**: Configure TLS termination in front of services

## Troubleshooting

### mpclient Shows Blank Screen
- Check `content-encoding` header handling
- Ensure gzip decompression is working
- Verify browser console for errors
- Check FHIR_BASE_URL configuration

### Token Exchange Fails
- Verify `MEDPLUM_TOKEN_URL` is correct
- Check client credentials (ID and Secret)
- Ensure Medplum server is running and healthy
- Check network connectivity between containers

### Database Connection Issues
- Verify postgres-db is running: `docker ps | grep postgres`
- Check environment variables match compose file
- Ensure proper postgres image is pulled
- Check volume permissions

### CORS Errors
- Set `MEDPLUM_ALLOWED_ORIGINS` to include your domain
- In development, set to `"*"` (not recommended for production)
- Verify mpclient is on allowed origin list

## Integration with Other DHTI Services

Medplum can be combined with other DHTI modules:

```bash
# Medplum with OpenMRS
dhti-cli compose add -m medplum -m openmrs

# Medplum with LangServe for AI/ML
dhti-cli compose add -m medplum -m langserve

# Full stack with analytics
dhti-cli compose add -m medplum -m neo4j -m langfuse
```

## Monitoring and Health Checks

### Check Service Health
```bash
# Medplum server health
curl http://localhost:8103/healthcheck

# mpclient status
curl http://localhost:8111/

# Database health
docker exec $(docker ps -q -f "name=postgres-db") \
  pg_isready -U postgres -d postgres
```

### View Logs
```bash
docker logs dhti-medplum-server-1
docker logs dhti-medplum-app-1
docker logs dhti-mpclient-1
```

## Advanced Configuration

### Custom Config File (MEDPLUM_CONFIG_PATH)

Provide a custom `medplum.config.json` for advanced configuration:

```bash
MEDPLUM_CONFIG_PATH=/path/to/medplum.config.json \
  docker compose up -d medplum-server
```

### Environment-Based Configuration

For containerized environments without config files, all settings can be environment variables (default behavior).

### Storage Configuration

Default: File-based binary storage (`./binary/`)

For production, consider:
- S3-compatible object storage
- Google Cloud Storage
- Azure Blob Storage

## Resources

- **Medplum Documentation**: https://www.medplum.com/docs
- **FHIR Specification**: https://www.hl7.org/fhir/
- **OAuth2 RFC 6749**: https://tools.ietf.org/html/rfc6749
- **PKCE RFC 7636**: https://tools.ietf.org/html/rfc7636