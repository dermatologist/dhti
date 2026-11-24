---
name: start-dhti
description: Orchestrate DHTI infrastructure, elixirs, and conches using the DHTI CLI and Docker.
---

## When to Use This Skill

Use this skill to install elixirs or conches produced by the other DHTI skills and start a development environment for testing or prototyping.

## Resolve the Target First

Determine these values before running commands:

- `WORKSPACE`: absolute workspace directory containing generated projects.
- `ELIXIR_NAME`: package name, usually the package directory name.
- `ELIXIR_PATH`: absolute path to `WORKSPACE/dhti-elixir/packages/<elixir-name>`.
- `CONCH_NAME`: package name under the OpenMRS monorepo.
- `CONCH_PATH`: absolute path to `WORKSPACE/openmrs-esm-dhti/packages/<conch-name>`.
- `COMPOSE_FILE`: default `~/dhti/docker-compose.yml`, unless the user specifies another file.
- `IMAGE_TAG`: full image name and tag, such as `dhti/genai-test:1.0`.

Choose one target profile:

- **OpenMRS conch:** Compose `langserve` and `openmrs`, then start the OpenMRS development server.
- **CDS Hooks elixir:** Compose `langserve`, then start the CDS Hooks sandbox.
- **Infrastructure only:** Compose only the requested modules.

If both elixir and conch components exist, compose `langserve` and `openmrs` and install both.

## Prerequisites

Verify before any mutation:

```bash
node --version
npm --version
npx dhti-cli --help
docker --version
docker compose version
docker ps
```

When developing from this repository rather than using the published CLI:

```bash
npm install
npm run build
npm link
npx dhti-cli --help
```

Do not proceed if Docker is unavailable, required paths do not exist, or a required host port is already occupied.

## Preflight

Run mutating commands with `--dry-run` before executing them:

```bash
npx dhti-cli compose add -m langserve -m openmrs --dry-run
npx dhti-cli elixir install -l <elixir-path> -n <elixir-name> --dry-run
npx dhti-cli conch install -l <conch-path> -n <conch-name> --dry-run
npx dhti-cli docker -n <image-tag> -t elixir --dry-run
npx dhti-cli docker -u --dry-run
```

Use absolute paths to avoid ambiguity. Do not use `compose reset` unless the user explicitly wants to discard the existing Compose configuration.

### 1. Environment Setup

1. **Verify Prerequisites:**
   - Check that Node.js and Docker are installed
   - Verify Docker is running: `docker ps`

2. **Directory Structure**

```
workspace/
└── dhti-elixir/
    └── packages/
        └── <name>/                # Your generated elixir package
            ├── notes/todo.md          # Your detailed TODO list and plan
            ├── src/dhti_elixir_<name>/   # Main code for the elixir
            │   ├── chain.py              # Main chain implementation
            │   ├── bootstrap.py          # Bootstrap/configuration file
            │   ├── README.md             # Documentation for your elixir
            │   └── (other files, e.g., __init__.py, utils.py)
            ├── pyproject.toml            # Add new dependencies here
            └── tests/
                └── test_chain.py         # Example test file for chain.py
└── openmrs-esm-dhti/
    └── packages/
        └── esm-dhti-<name>/           # Your generated elixir package
            ├── notes/todo.md          # Your detailed TODO list and plan
            ├── src/   # Main code for the conch with multiple subdirectories.
            ├── package.json          # Update dependencies and metadata here
            └── README.md             # Documentation for your conch
```

### 2. Configure Docker Compose

For an OpenMRS or combined elixir/conch setup:

```bash
npx dhti-cli compose add -m langserve -m openmrs
```

For an elixir/CDS Hooks-only setup:

```bash
npx dhti-cli compose add -m langserve
```

Add supporting modules only when the application requires them:

- `-m ollama`: local LLM and web UI
- `-m langfuse`: monitoring
- `-m redis`: Redis and Redis Commander
- `-m neo4j`: Neo4j and graph utilities
- `-m cqlFhir`: CQL/FHIR services
- `-m mcpFhir`: MCP FHIR service
- `-m mcpx` or `-m docktor`: MCP/Docktor tooling

Verify the generated configuration:

```bash
npx dhti-cli compose read
docker compose -f ~/dhti/docker-compose.yml config
```

### 3. Install Elixir from a Local Directory

Confirm the elixir package contains `pyproject.toml` and `src/dhti_elixir_<normalized-name>/`. Hyphenated names are normalized to underscores for routes and dev sync.

Install from the absolute local package path:

```bash
npx dhti-cli elixir install -l <elixir-path> -n <elixir-name>
```

The operation adds the package to `~/dhti/elixir/pyproject.toml`. It fails if the local path is missing.

Build and register the elixir image:

```bash
npx dhti-cli docker -n dhti/genai-test:1.0 -t elixir
```

The Docker command builds `~/dhti/elixir` and sets `langserve.image` in the Compose file. Replace the image tag with the user's registry or requested tag.

### 4. Install Conch from a Local Directory

For a new monorepo, initialize the template:

```bash
npx dhti-cli conch init -w <workspace> -n <conch-name>
```

For an existing local package, verify `package.json` and install with an absolute path:

```bash
npx dhti-cli conch install -l <conch-path> -n <conch-name> -w <workspace>
```

The current implementation copies the source package to `<workspace>/<conch-name>`; it does not create `openmrs-esm-dhti/packages/<conch-name>` automatically.

### Development Sync and Runtime Bootstrap

Use these commands to sync work-in-progress code/assets into running containers. This is ideal for UI tweaks and elixir logic changes that don't alter dependencies.

- Elixir dev sync

```bash
npx dhti-cli elixir dev -d <elixir-path> -n <elixir-name> -c dhti-langserve-1
```

Note: If dependencies change (e.g., `requirements.txt` or `pyproject.toml`), rebuild the image instead of using dev sync.

There is currently no `conch dev` command. Rebuild the frontend image after conch source or dependency changes:

```bash
npx dhti-cli docker -n <image-tag> -t conch
```

Then restart the Compose stack. Clear the browser cache if stale assets remain.

- Update runtime bootstrap

```bash
npx dhti-cli docker bootstrap -f <elixir-path>/bootstrap.py -c dhti-langserve-1
```

This command copies the local file to `/app/app/bootstrap.py` in LangServe and restarts the container. Use it to update runtime configuration without rebuilding the image. Rebuild when dependencies or the image layout change.

### 5. Start DHTI Server

11. **Start All Services:**
    ```bash
    npx dhti-cli docker -u
    ```

### 6. Choose an Application Profile

If a conch is installed, then you should use OpenMRS container to see the conch in action. If no conch is installed, you can choose to use CDS-Hooks container to test the elixir functionality.

#### OpenMRS Profile

Start the monorepo with one or more package sources:

```bash
npx dhti-cli conch start \
  -l <workspace>/openmrs-esm-dhti \
  -s packages/<conch-name>
```

Repeat `-s` for multiple conches.

This command runs `yarn install` and `yarn start` in the monorepo and is interactive. Open:

- Through the gateway: `http://localhost/openmrs/spa/home`
- Direct frontend: `http://localhost:8003/openmrs/spa/home`

Credentials:

- Username: `admin`
- Password: `Admin123`

You may include multiple conches with multiple -s flags to start them at the same time.

#### CDS Hooks Profile

Check whether port `8080` is available, then start the CDS Hooks sandbox:

```bash
npx dhti-cli elixir start -n <elixir-name>
```

Example:

```bash
npx dhti-cli elixir start -n glycemic_advisor
```

This command is interactive and starts the CDS Hooks sandbox. Capture the exact `Application link` printed by the command and give that URL to the user.

### Cleanup

Stop and remove the Compose stack:

```bash
npx dhti-cli docker -d
```

Restart it with:

```bash
npx dhti-cli docker -u
```

Removing workdirs or Docker images is destructive and requires explicit user approval.

## Health and Verification

Use bounded retries rather than fixed waits:

```bash
curl --fail --retry 30 --retry-delay 2 http://localhost:8001/docs
curl --fail --retry 30 --retry-delay 2 http://localhost:8003/openmrs/spa/

docker compose -f ~/dhti/docker-compose.yml ps
```

Report success only after the relevant endpoint responds and the selected containers are running or healthy.

## Troubleshooting

Common issues and solutions:

1. **Docker containers fail to start:**
   - Check Docker is running: `docker ps`
   - Verify port availability for `80`, `8001`, `8002`, `8003`, `9001`, and `8080`
   - Check Docker logs: `docker compose -f ~/dhti/docker-compose.yml logs <service-name>`

2. **Elixir installation fails:**
   - Verify the absolute path exists and is accessible.
   - Ensure `pyproject.toml` exists.
   - Ensure `src/dhti_elixir_<normalized-name>` exists.

3. **Conch installation fails:**
   - Verify the absolute source path exists and is accessible.
   - Verify `package.json` and the ESM package structure.
   - Check whether `conch init` is more appropriate than `conch install` for a new monorepo.

4. **OpenMRS not accessible:**
   - Check frontend, backend, database, and gateway health.
   - Verify `http://localhost/openmrs/spa/home` or `http://localhost:8003/openmrs/spa/home`.
   - Check `docker compose -f ~/dhti/docker-compose.yml logs -f frontend backend openmrs-db gateway`.

## Notes

- Always use dry-run mode first to verify commands
- Generated projects can be version controlled and shared
- Docker images can be pushed to registries for deployment
- The skill creates a development-oriented DHTI environment; provider credentials and external services may still require configuration
- The user conversation may provide context on the work you have done in the past. Always internalize that and reuse it where possible.
