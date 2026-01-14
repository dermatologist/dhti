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

- `-e, --elixir <url>`: Elixir endpoint URL for CDS services
  - Default: `http://localhost:8001/langserve/dhti_elixir_schat/cds-services`

- `-f, --fhir <url>`: FHIR endpoint URL
  - Default: `http://hapi.fhir.org/baseR4`

- `--dry-run`: Show what changes would be made without executing them

## Examples

### Basic usage with defaults
```bash
dhti-cli elixir start
```

This will:
1. Clone CDS Hooks Sandbox to `~/dhti/cds-hooks-sandbox`
2. Install dependencies with `yarn install`
3. Configure endpoints with defaults
4. Show the command to start the dev server

### Custom endpoints
```bash
dhti-cli elixir start \
  -w /path/to/workspace \
  --elixir http://my-server:8001/cds-services \
  --fhir http://my-fhir-server/R4
```

### Dry run to preview changes
```bash
dhti-cli elixir start --dry-run
```

## What it Does

1. **Clones** the CDS Hooks Sandbox repository to `{workdir}/cds-hooks-sandbox`
2. **Installs** dependencies using `yarn install`
3. **Configures** the DHTI endpoints with `yarn dhti <elixir> <fhir>`
4. **Provides** the command to start the development server

## After Setup

Once the setup is complete, you can start the development server with:

```bash
cd ~/dhti/cds-hooks-sandbox
yarn dev
```

The sandbox will be available at `http://localhost:3000` (default Yarn dev port).

## Related Commands

- `dhti-cli elixir init` - Initialize a new elixir workspace
- `dhti-cli elixir install` - Install/add an elixir to the Docker setup
- `dhti-cli compose add` - Add modules to Docker Compose configuration
