---
name: start-dhti
description: This skill enables AI agents to orchestrate the DHTI development workflow by installing elixirs and conches, and starting a fully functional DHTI server with all components installed using Docker.
---


## When to Use This Skill

Use this skill when you need to:
- Install elixirs and conches created by other skills
- Set up a fully functional DHTI development server for testing and prototyping
- Rapidly prototype GenAI healthcare applications with both backend and frontend components

## Prerequisites

Before using this skill, ensure you have:
- Node.js (>= 18.0.0) installed
- Docker and Docker Compose installed and running
- Sufficient disk space for Docker images

## Instructions
You are a DHTI orchestration agent working to create a complete GenAI healthcare application. Follow these instructions sequentially.
The user conversation may provide context on the work you have done in the past. Always internalize that and reuse it where possible.

### Phase 1: Environment Setup

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

### Phase 2: Set Up DHTI Infrastructure

5. **Create Docker Compose Configuration:**
   ```bash
   npx dhti-cli compose add -m langserve
   ```

   This creates a Docker Compose configuration with:
   - LangServe (GenAI backend)
   - Other necessary infrastructure

   Optionally add additional modules as needed:
   - `-m ollama` for local LLM hosting
   - `-m langfuse` for monitoring
   - `-m redis` for vector store
   - `-m neo4j` for graph utilities
   - `-m cqlFhir` for CQL support
   - `-m mcpFhir` for MCP server

6. **Verify Compose Configuration:**
   ```bash
   npx dhti-cli compose read
   ```

### Phase 3: Install Elixir from Local Directory (If Applicable)

7. **Install the Generated Elixir:**
   - Install the elixir from `workspace` directory in the current path.
   - If workspace directory does not exist, use the path provided in the original user prompt.
   - Use the `-l` flag to specify the directory.
   - Use -n flag with the elixir's project name (starting with `dhti-elixir-`)

   ```bash
   npx dhti-cli elixir install -l <elixir-path> -n <elixir-name>
   ```

   Example:
   ```bash
   npx dhti-cli elixir install -l workspace/dhti-elixir/packages/glycemic_advisor -n glycemic_advisor
   ```

8. **Build Elixir Docker Image:**
   ```bash
   npx dhti-cli docker -n dhti/genai-test:1.0 -t elixir
   ```

   Replace `dhti` with your Docker Hub username or registry name if available from the original user prompt.

### Phase 4: Install Conch from Local Directory (If Applicable)

9. **Install the Generated Conch:**
   - Install the conch from `workspace` directory in the current path.
   - If workspace directory does not exist, use the path provided in the original user prompt.
   - Use the  `-l` flag to install the conch from the directory.
   - Use -n flag with the conch's project name (starting with `openmrs-esm-dhti-`)

   ```bash
   npx dhti-cli conch install -l <conch-path> -n <conch-name>
   ```

   Example:
   ```bash
   npx dhti-cli conch install -l workspace/openmrs-esm-dhti/packages/esm-glycemic-advisor -n esm-glycemic-advisor
   ```

### Hot Reload / Dev Sync (If Applicable)

Use these commands to sync work-in-progress code/assets into running containers. This is ideal for UI tweaks and elixir logic changes that don't alter dependencies.

- Elixir dev sync

```bash
npx dhti-cli elixir dev -d <<workspace>>/dhti-elixir/packages/<<elixir-name>> -n <<elixir-name>> -c dhti-langserve-1
```

Note: If dependencies change (e.g., `requirements.txt` or `pyproject.toml`), rebuild the image instead of using dev sync.

- Conch dev sync

```bash
npx dhti-cli conch dev -d <<workspace>>/openmrs-esm-dhti/packages/<<conch-name>> -n <<conch-name>> -c dhti-frontend-1
```

Tip: Clear your browser cache if assets look stale after syncing.

- Update runtime bootstrap

```bash
npx dhti-cli docker bootstrap -f <<workspace>>/bootstrap.py -c dhti-langserve-1
```
When run for the first time, this command will copy the bootstrap file into the langserve container to workspace.
Subsequent runs will sync changes from the local bootstrap file to the container, allowing you to update runtime configurations without rebuilding the image. This is especially useful for tweaking model settings, tool configurations, or other parameters defined in the bootstrap file during development.

### Phase 5: Start DHTI Server

11. **Start All Services:**
    ```bash
    npx dhti-cli docker -u
    ```

### Phase 6: Decide whether to use OpenMRS or CDS-Hooks container.

If a conch is installed, then you should use OpenMRS container to see the conch in action. If no conch is installed, you can choose to use CDS-Hooks container to test the elixir functionality.

#### If using OpenMRS container:
```
npx dhti-cli conch install # if you have not performed this step before.
npx dhti-cli conch start -s packages/<<conch-name>>
```

Example:
```
npx dhti-cli conch install # if you have not performed this step before.
npx dhti-cli conch start -s packages/esm-chatbot-agent
```

   - Login to OpenMRS with at `http://localhost:8080/openmrs/spa/home`
     - Username: `admin`
     - Password: `Admin123`

You may include multiple conches with multiple -s flags to start them at the same time.

12. **Wait for Services to Initialize:**
    - Wait 2-3 minutes for all services to fully start
    - Monitor logs: `docker compose logs -f`

13. **Hand off with the following instructions:**
    - Navigate to `http://localhost:8080/openmrs/spa/home`
    - Login credentials:
      - Username: `admin`
      - Password: `Admin123`

#### If using CDS-Hooks container:

```
npx dhti-cli elixir start -n <<elixir-name>>
```

Example:
```
npx dhti-cli elixir start -n glycemic_advisor
```

NOTE the `Application link` in the output rather than the final display link.

12. **Wait for Services to Initialize:**
   - Wait 2-3 minutes for all services to fully start
   - Monitor logs: `docker compose logs -f`

13. **Hand off with the following instructions:**
   - Use the `Application link`: <<application-link>>
   - Open this in browser to access the application

### Phase 9: Clean Up (If Needed)

18. **Cleanup Instructions:**
    - Provide commands to stop and remove containers:
      ```bash
      npx dhti-cli docker -d
      ```
    - Document how to restart the server
    - Explain how to rebuild images after changes

### Development Mode (Optional)


## Dry-Run Mode

Before making any changes, use the `--dry-run` flag to preview actions:

```bash
npx dhti-cli compose add -m openmrs -m langserve --dry-run
npx dhti-cli elixir install -l <path> -n <name> --dry-run
npx dhti-cli conch install -l <path> -n <name> --dry-run
```

## Troubleshooting

Common issues and solutions:

1. **Docker containers fail to start:**
   - Check Docker is running: `docker ps`
   - Verify port availability (80, 8080, 8000)
   - Check Docker logs: `docker compose logs <service-name>`

2. **Elixir installation fails:**
   - Verify the path exists and is accessible
   - Check that the elixir project structure is correct
   - Ensure pyproject.toml exists in the elixir directory

3. **Conch installation fails:**
   - Verify the path exists and is accessible
   - Check that routes.json exists in the conch directory
   - Ensure the conch follows OpenMRS ESM structure

4. **OpenMRS not accessible:**
   - Wait longer for initialization (3-5 minutes)
   - Check nginx gateway logs
   - Verify all containers are running: `docker ps`

## Notes

- Always use dry-run mode first to verify commands
- Generated projects can be version controlled and shared
- Docker images can be pushed to registries for deployment
- The skill creates a complete, production-ready DHTI application
- The user conversation may provide context on the work you have done in the past. Always internalize that and reuse it where possible.

