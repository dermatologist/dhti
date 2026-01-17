# Compose env Operation

The `env` operation allows you to add or update environment variables in Docker Compose services.

## Usage

```bash
dhti-cli compose env [flags]
```

## Flags

- `--env, -e` (required): Environment variable name (e.g., `FHIR_BASE_URL`)
- `--value, -v` (required): Environment variable value
- `--service, -s` (optional, default: `langserve`): Service name to update
- `--file, -f` (optional, default: `~/dhti/docker-compose.yml`): Path to docker-compose.yml
- `--host` (optional, boolean): Use host environment variable pattern
- `--dry-run` (optional): Show what changes would be made without actually making them

## Examples

### Add a new environment variable

```bash
dhti-cli compose env --env FHIR_BASE_URL --value http://localhost:8080/fhir/R4
```

This will add `FHIR_BASE_URL=http://localhost:8080/fhir/R4` to the `langserve` service in docker-compose.yml.

### Update an existing environment variable

```bash
dhti-cli compose env --env FHIR_BASE_URL --value http://hapi.fhir.org/baseR4
```

If `FHIR_BASE_URL` already exists in the `langserve` service, its value will be updated, and both old and new values will be displayed.

### Use a different service

```bash
dhti-cli compose env --service openmrs --env DATABASE_URL --value postgresql://localhost:5432/openmrs
```

### Use host environment variable pattern

The `--host` flag allows the environment variable to be overridden by host environment variables or `.env` files:

```bash
dhti-cli compose env --env FHIR_BASE_URL --value http://localhost:8080/fhir/R4 --host
```

This will set the environment variable as: `FHIR_BASE_URL=${FHIR_BASE_URL:-http://localhost:8080/fhir/R4}`

This means:
- If `FHIR_BASE_URL` is set in the host environment or `.env` file, that value will be used
- Otherwise, the default value `http://localhost:8080/fhir/R4` will be used

### Dry run (preview changes)

```bash
dhti-cli compose env --env FHIR_BASE_URL --value http://localhost:8080/fhir/R4 --dry-run
```

This will show what changes would be made without actually modifying the docker-compose.yml file.

## Behavior

- If the environment variable does **not exist** in the service, it will be **added**
- If the environment variable **already exists**, its value will be **updated** and both old and new values will be shown
- After updating the file, `docker compose up -d` is executed to apply the changes
- The operation exits with an error if mandatory flags are missing or if the service doesn't exist

## Related Commands

- `dhti-cli compose add` - Add modules to docker-compose.yml
- `dhti-cli compose delete` - Remove modules from docker-compose.yml
- `dhti-cli compose read` - Display current docker-compose.yml
