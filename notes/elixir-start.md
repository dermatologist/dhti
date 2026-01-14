# Elixir Start Operation

The `elixir start` operation sets up and starts a CDS Hooks Sandbox instance integrated with DHTI endpoints.

## Overview

This operation:
1. **Clones or reuses** the CDS Hooks Sandbox repository (conditionally)
2. **Installs dependencies** (only if directory was cloned)
3. **Configures DHTI endpoints** (elixir service URL and FHIR base URL)
4. **Updates docker-compose.yml** (FHIR_BASE_URL in langserve service)
5. **Restarts Docker container** to apply new environment
6. **Provides dev server instructions**

## Conditional Clone/Install Behavior

The operation intelligently handles directory existence:

- **Directory doesn't exist**: Clones `cds-hooks-sandbox` and installs dependencies via `yarn install`
- **Directory already exists**: Skips clone and install, goes directly to DHTI configuration
- This allows you to update configuration without re-cloning the repository

## Command Syntax

```bash
dhti-cli elixir start [OPTIONS]
```

## Options

### `-n, --name <name>` (Optional)
Specifies the elixir service name. If provided without `--elixir`, automatically constructs the URL as:
```
http://localhost:8001/langserve/{name_with_underscores}/cds-services
```

Dashes in the name are converted to underscores:
- Input: `my-service-name`
- URL: `http://localhost:8001/langserve/my_service_name/cds-services`

Either `--name` or `--elixir` must be provided.

### `-e, --elixir <url>` (Optional)
Specifies the custom elixir/langserve endpoint URL. If not provided, uses URL constructed from `--name`.

Examples:
- `http://localhost:8001/langserve/my_service/cds-services`
- `http://remote-server:8080/services/custom-service`

### `--fhir <url>` (Optional)
Specifies the FHIR server base URL. Default is `http://hapi.fhir.org/baseR4`.

This value is written to the `docker-compose.yml` file in the `langserve` service's `FHIR_BASE_URL` environment variable.

Examples:
- `http://localhost:8080/fhir` (local FHIR server)
- `http://custom-fhir:9080/R4` (custom endpoint)
- `https://fhir.healthcare.gov/baseR4` (remote server)

### `-c, --container <name>` (Optional)
Specifies the Docker container name to restart. Default is `dhti-langserve-1`.

Used to restart the container after updating the docker-compose.yml file.

### `-w, --workdir <path>` (Optional)
Specifies the working directory where CDS Hooks Sandbox is cloned/exists. Default is the user's home directory (`~`).

This is also where the `docker-compose.yml` file should be located for environment variable updates.

### `--dry-run`
Shows what would be executed without actually running commands. Useful for verification:
- Shows whether clone/install would be skipped
- Displays all commands that would be executed
- No changes are made to the system

## Docker Environment Configuration

The operation updates the `docker-compose.yml` file with the FHIR server URL:

**Process:**
1. Reads the docker-compose.yml file from the workdir
2. Updates the `langserve` service's `FHIR_BASE_URL` environment variable
3. Writes the updated file back
4. Restarts the container to apply the new environment

**Example docker-compose.yml langserve service:**
```yaml
langserve:
  image: beapen/genai:latest
  network_mode: host
  ports:
    - "8001:8001"
  environment:
    - OLLAMA_SERVER_URL=http://ollama:11434
    - FHIR_BASE_URL=http://localhost:8080/openmrs/ws/fhir2/R4  # Updated by start operation
```

## Examples

### Basic Usage with Name (Constructs URL)
```bash
dhti-cli elixir start -n my-elixir-service
```
- Clones to: `~/cds-hooks-sandbox`
- Elixir URL: `http://localhost:8001/langserve/my_elixir_service/cds-services`
- FHIR URL: `http://hapi.fhir.org/baseR4` (default)
- Updates: `~/docker-compose.yml` with FHIR_BASE_URL

### Custom Workdir (Reuses Existing)
```bash
dhti-cli elixir start -w /opt/services -n my-service
```
- Uses/clones to: `/opt/services/cds-hooks-sandbox`
- If directory exists, skips clone and install
- Updates: `/opt/services/docker-compose.yml` with FHIR_BASE_URL

### Custom Elixir and FHIR URLs
```bash
dhti-cli elixir start \
  --elixir http://remote-server:8080/langserve/custom/cds-services \
  --fhir http://custom-fhir:9080/R4 \
  --container my-app-server
```
- Skips clone (directory exists)
- Configures custom elixir endpoint
- Updates docker-compose.yml with custom FHIR server
- Restarts specified container

### Update Configuration on Existing Directory
```bash
dhti-cli elixir start -w /opt/services -n my-service --fhir http://new-fhir:8080/R4
```
- Detects existing directory
- Skips clone and install
- Updates DHTI configuration with new FHIR URL
- Updates docker-compose.yml and restarts container

### Dry-Run Preview
```bash
dhti-cli elixir start --dry-run -n test-service -w /tmp/demo
```

Output (new directory):
```
[DRY RUN] Would execute start operation:
  npx degit dermatologist/cds-hooks-sandbox /tmp/demo/cds-hooks-sandbox
  cd /tmp/demo/cds-hooks-sandbox
  yarn install
  yarn dhti http://localhost:8001/langserve/test_service/cds-services http://hapi.fhir.org/baseR4
  Update docker-compose.yml FHIR_BASE_URL=http://hapi.fhir.org/baseR4
  docker restart dhti-langserve-1
  yarn dev
```

Output (existing directory - notice clone/install skipped):
```
[DRY RUN] Would execute start operation:
  [SKIP] Directory already exists: /tmp/demo/cds-hooks-sandbox
  yarn dhti http://localhost:8001/langserve/test_service/cds-services http://hapi.fhir.org/baseR4
  Update docker-compose.yml FHIR_BASE_URL=http://hapi.fhir.org/baseR4
  docker restart dhti-langserve-1
  yarn dev
```

## Error Handling

### Missing Required Flags
```
Error: Either --elixir or --name flag must be provided
```
**Solution**: Provide one of these flags

### docker-compose.yml Not Found
```
⚠ Warning: docker-compose.yml not found at /path/to/workdir/docker-compose.yml
```
**Solution**: Ensure docker-compose.yml exists in the workdir, or update your workdir path

### langserve Service Not Found
```
⚠ Warning: langserve service not found in docker-compose.yml
```
**Solution**: Ensure your docker-compose.yml has a `langserve` service defined

### Docker Container Not Found
```
⚠ Warning: Docker container dhti-langserve-1 not found. Skipping container restart.
```
**Solution**: Ensure Docker container is running, or use `-c` to specify correct container name

### Yarn/Node Issues
Ensure Node.js >= 18 and yarn are installed:
```bash
node --version  # Should be >= 18.0.0
yarn --version  # Should be available
```

## Integration Workflow

Typical workflow for integrating a new elixir service:

1. **Ensure prerequisites**: Docker running, docker-compose.yml exists in workdir
2. **Setup**: Start the elixir service (e.g., LangServe)
3. **Configure**: Run the start operation
   ```bash
   dhti-cli elixir start -n my-new-service
   ```
4. **Verify**: Check docker-compose.yml was updated
   ```bash
   grep FHIR_BASE_URL /path/to/docker-compose.yml
   ```
5. **Start containers**: Using your docker-compose setup
6. **Update**: To change FHIR server:
   ```bash
   dhti-cli elixir start -w ~/dhti -n my-new-service --fhir http://new-fhir:8080/R4
   ```

The conditional clone/install behavior means subsequent runs are faster as they skip repository cloning.

## Related Commands

- `dhti-cli elixir dev` - Run development server without setup
- `dhti-cli elixir install` - Install dependencies in existing directory
- `dhti-cli elixir init` - Initialize a new elixir service

## References

- [CDS Hooks Sandbox](https://github.com/dermatologist/cds-hooks-sandbox)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FHIR Base URL Configuration](https://www.hl7.org/fhir/overview.html)
