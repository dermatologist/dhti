# Elixir Start Operation

The `dhti-cli elixir start` command initializes and starts a CDS Hooks Sandbox environment configured with your DHTI elixir and FHIR server endpoints.

## Overview

This operation automates the setup of the [CDS Hooks Sandbox](https://github.com/dermatologist/cds-hooks-sandbox) with your custom elixir and FHIR endpoints, making it easy to test your CDS services in a sandbox environment.

## Usage

```bash
dhti-cli elixir start [options]
```

## Options

- `-w, --workdir <path>`: Working directory where the sandbox will be cloned
  - Default: `$HOME/dhti`

- `-e, --elixir <url>`: **(Optional)** Elixir endpoint URL for CDS services
  - If not provided, it will be constructed as `http://localhost:8001/langserve/<<name_with_underscores>>/cds-services`
  - `<<name_with_underscores>>` is derived from the `--name` flag by replacing hyphens with underscores
  - Either `--elixir` or `--name` must be provided (error if both are absent)

- `-n, --name <value>`: **(Optional)** Name of the elixir (used to construct the elixir URL if `--elixir` is not provided)
  - Required only if `--elixir` is not provided

- `-f, --fhir <url>`: FHIR endpoint URL
  - Default: `http://hapi.fhir.org/baseR4`

- `-c, --container <name>`: Docker container name for setting the FHIR_BASE_URL environment variable
  - Default: `dhti-langserve-1`
  - The container will be updated with `FHIR_BASE_URL` environment variable and restarted

- `--dry-run`: Show what changes would be made without executing them

## Examples

### Using custom elixir endpoint
```bash
dhti-cli elixir start --elixir http://my-server:8001/cds-services
```

This will:
1. Clone CDS Hooks Sandbox to `~/dhti/cds-hooks-sandbox`
2. Install dependencies with `yarn install`
3. Configure endpoints with the provided elixir URL
4. Show the command to start the dev server

### Using elixir name (auto-construct URL)
```bash
dhti-cli elixir start -n my-custom-elixir
```

This will construct the elixir URL as `http://localhost:8001/langserve/my_custom_elixir/cds-services` and use it to configure the sandbox.

### Using name with dashes
```bash
dhti-cli elixir start -n my-elixir-service
```

The dashes in the name are automatically converted to underscores in the URL:
- URL becomes: `http://localhost:8001/langserve/my_elixir_service/cds-services`

### Custom workspace and FHIR endpoint
```bash
dhti-cli elixir start \
  -w /path/to/workspace \
  -n my-elixir \
  --fhir http://my-fhir-server/R4
```

### Custom Docker container for FHIR configuration
```bash
dhti-cli elixir start \
  -n my-elixir \
  -c my-custom-container \
  --fhir http://my-fhir-server/R4
```

This will set the FHIR_BASE_URL environment variable on the `my-custom-container` Docker container and restart it.

### Dry run to preview changes
```bash
dhti-cli elixir start -n my-elixir --dry-run
```

## What it Does

1. **Validates** that either `--elixir` or `--name` is provided
2. **Constructs** the elixir URL if not explicitly provided (using `--name`)
3. **Clones** the CDS Hooks Sandbox repository to `{workdir}/cds-hooks-sandbox`
4. **Installs** dependencies using `yarn install`
5. **Configures** the DHTI endpoints with `yarn dhti <elixir> <fhir>`
6. **Sets up** Docker container environment:
   - Sets `FHIR_BASE_URL` environment variable on the container using `docker update`

## After Setup

Once the setup is complete, you can start the development server with:

```bash
cd ~/dhti/cds-hooks-sandbox
yarn dev
```

The sandbox will be available at `http://localhost:3000` (default Yarn dev port).

## Docker Environment Variables

The `start` operation sets the `FHIR_BASE_URL` environment variable on the specified Docker container to enable communication with your FHIR server. This is done using:

```bash
docker update --env FHIR_BASE_URL=<fhir_url> <container_name>
docker restart <container_name>
```

The container must be running or have been run before. If the container doesn't exist, a warning will be displayed, but the operation will continue.

## Related Commands

- `dhti-cli elixir init` - Initialize a new elixir workspace
- `dhti-cli elixir install` - Install/add an elixir to the Docker setup
- `dhti-cli compose add` - Add modules to Docker Compose configuration
