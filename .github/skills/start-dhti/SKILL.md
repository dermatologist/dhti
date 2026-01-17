---
 name: start-dhti
 description: This skill enables AI agents to orchestrate the DHTI development workflow: installing elixirs and conches, and starting a fully functional DHTI server with all components installed.
---


## When to Use This Skill

Use this skill when you need to:
- Create a complete DHTI application from scratch with both backend (elixir) and frontend (conch) components
- Install elixirs and conches created by other skills
- Set up a fully functional DHTI development server for testing and prototyping
- Rapidly prototype GenAI healthcare applications with both backend and frontend components

## Prerequisites

Before using this skill, ensure you have:
- Node.js (>= 18.0.0) installed
- Docker and Docker Compose installed and running
- Python 3.x installed (for elixir development)
- `uv` package manager (will be installed if not present)
- Sufficient disk space for Docker images

## Instructions

You are a DHTI orchestration agent working to create a complete GenAI healthcare application. Follow these instructions sequentially.

### Phase 1: Environment Setup

1. **Verify Prerequisites:**
   - Check that Node.js, Docker, and Python are installed
   - Verify Docker is running: `docker ps`

2. **Install DHTI CLI:**
   - If not already installed globally: `npm install -g dhti-cli`
   - Or use via npx: `npx dhti-cli help`


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
   - Use the new `-l` flag to install the elixir from the local directory specified in the original user prompt.
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
   - Use the new `-l` flag to install the conch from the local directory specified in the original user prompt.
   - Use -n flag with the conch's project name (starting with `openmrs-esm-dhti-`)

   ```bash
   npx dhti-cli conch install -l <conch-path> -n <conch-name>
   ```

   Example:
   ```bash
   npx dhti-cli conch install -l workspace/openmrs-esm-dhti/packages/esm-glycemic-advisor -n esm-glycemic-advisor
   ```


### Phase 5: Start DHTI Server

11. **Start All Services:**
    ```bash
    npx dhti-cli docker -u
    ```

   - Start openmrs
```
npx dhti-cli conch start -n <conch-name>
```

Example:
```
npx dhti-cli conch start -n esm-glycemic-advisor
```

   - Login to OpenMRS with at `http://localhost:8080/openmrs/spa/home`
     - Username: `admin`
     - Password: `Admin123`



12. **Wait for Services to Initialize:**
    - Wait 2-3 minutes for all services to fully start
    - Monitor logs: `docker compose logs -f`

### Phase 6: Verify and Test

13. **Access OpenMRS:**
    - Navigate to `http://localhost:8080/openmrs/spa/home`
    - Login credentials:
      - Username: `admin`
      - Password: `Admin123`

14. **Verify Conch Installation:**
    - Look for the new conch in the OpenMRS interface
    - It should appear in the navigation or as configured in routes.json
    - Test the UI functionality

15. **Verify Elixir Installation:**
    - Check that the elixir endpoints are accessible
    - Test the GenAI functionality through the conch
    - Verify FHIR data retrieval works correctly

16. **Run Integration Tests:**
    - If provided in the generated projects, run integration tests
    - Verify end-to-end functionality
    - Check for any errors in Docker logs

### Phase 9: Documentation and Handoff

17. **Create Summary Documentation:**
    - Document the complete setup in a `notes/<<name>>.md` file
    - Include:
      - Elixir name, location, and functionality
      - Conch name, location, and functionality
      - Docker images created
      - Access URLs and credentials
      - Testing instructions
      - Known issues or limitations

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

## Expected Output

A fully functional DHTI development environment that includes:
- A custom elixir implementing the specified GenAI backend logic
- A custom conch implementing the specified UI components
- Complete Docker-based infrastructure with all necessary services
- Working integration between elixir and conch
- Accessible OpenMRS interface with the new functionality
- Documentation for setup, testing, and development



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

## Related Skills

- **elixir-generator**: For generating standalone elixirs
- **conch-generator**: For generating standalone conches

