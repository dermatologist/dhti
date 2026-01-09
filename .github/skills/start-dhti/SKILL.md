# DHTI Start Server Skill

## Description

This skill enables AI agents to orchestrate the complete DHTI development workflow: generating elixirs, creating conches, and starting a fully functional DHTI server with both components installed. This skill combines the capabilities of the elixir-generator and conch-generator skills with the new local directory installation feature to provide an end-to-end development experience.

## When to Use This Skill

Use this skill when you need to:
- Create a complete DHTI application from scratch with both backend (elixir) and frontend (conch) components
- Generate and install elixirs and conches created by other skills
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
   - Install `uv` if not already present: `pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`
   - Verify Docker is running: `docker ps`

2. **Install DHTI CLI:**
   - If not already installed globally: `npm install -g dhti-cli`
   - Or use via npx: `npx dhti-cli help`

### Phase 2: Generate Elixir (Backend)

3. **Invoke the elixir-generator skill:**
   - Use the elixir-generator skill to create a new DHTI elixir based on the requirements below
   - The elixir should be created in a dedicated directory (e.g., `./generated-elixir/`)
   - Note the absolute path to the generated elixir directory for later installation

**Elixir Requirements:**
<!-- Replace this section with the actual elixir requirements -->
[Specify the elixir functionality, FHIR resources needed, clinical logic, etc.]
<!-- End Elixir Requirements -->

**Expected Output:**
- A fully functional elixir project in a dedicated directory
- Project name starting with `dhti-elixir-`
- Project slug starting with `dhti_elixir_`
- All tests passing
- README.md with usage instructions

### Phase 3: Generate Conch (Frontend)

4. **Invoke the conch-generator skill:**
   - Use the conch-generator skill to create a new OpenMRS conch based on the requirements below
   - The conch should be created in a dedicated directory (e.g., `./generated-conch/`)
   - Note the absolute path to the generated conch directory for later installation

**Conch Requirements:**
<!-- Replace this section with the actual conch requirements -->
[Specify the UI components, patient context, DHTI service integration, etc.]
<!-- End Conch Requirements -->

**Expected Output:**
- A fully functional OpenMRS ESM module in a dedicated directory
- Project name starting with `openmrs-esm-dhti-`
- All tests passing
- README.md with usage instructions
- Proper route and extension configuration

### Phase 4: Set Up DHTI Infrastructure

5. **Create Docker Compose Configuration:**
   ```bash
   npx dhti-cli compose add -m openmrs -m langserve
   ```
   
   This creates a Docker Compose configuration with:
   - OpenMRS (EMR)
   - LangServe (GenAI backend)
   - FHIR server (HAPI)
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

### Phase 5: Install Elixir from Local Directory

7. **Install the Generated Elixir:**
   - Use the new `-l` flag to install the elixir from the local directory
   - Replace `<elixir-path>` with the absolute path to the generated elixir directory
   - Replace `<elixir-name>` with the elixir's project slug (starting with `dhti-elixir-`)
   
   ```bash
   npx dhti-cli elixir install -l <elixir-path> -n <elixir-name>
   ```
   
   Example:
   ```bash
   npx dhti-cli elixir install -l /home/user/projects/generated-elixir -n dhti-elixir-glycemic
   ```

8. **Build Elixir Docker Image:**
   ```bash
   npx dhti-cli docker -n yourdockerhandle/genai-test:1.0 -t elixir
   ```
   
   Replace `yourdockerhandle` with your Docker Hub username or registry name.

### Phase 6: Install Conch from Local Directory

9. **Install the Generated Conch:**
   - Use the new `-l` flag to install the conch from the local directory
   - Replace `<conch-path>` with the absolute path to the generated conch directory
   - Replace `<conch-name>` with the conch's project name (starting with `openmrs-esm-dhti-`)
   
   ```bash
   npx dhti-cli conch install -l <conch-path> -n <conch-name>
   ```
   
   Example:
   ```bash
   npx dhti-cli conch install -l /home/user/projects/generated-conch -n openmrs-esm-dhti-glycemic
   ```

10. **Build Conch Docker Image:**
    ```bash
    npx dhti-cli docker -n yourdockerhandle/conch-test:1.0 -t conch
    ```

### Phase 7: Start DHTI Server

11. **Start All Services:**
    ```bash
    npx dhti-cli docker -u
    ```
    
    This command starts all Docker containers defined in the compose file. Services typically include:
    - OpenMRS on `http://localhost/openmrs`
    - LangServe backend
    - FHIR server
    - Generated elixir
    - Generated conch

12. **Wait for Services to Initialize:**
    - Wait 2-3 minutes for all services to fully start
    - OpenMRS initialization can take time on first startup
    - Monitor logs: `docker compose logs -f`

### Phase 8: Verify and Test

13. **Access OpenMRS:**
    - Navigate to `http://localhost/openmrs/spa/home`
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
    - Document the complete setup in a `SETUP.md` file
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

19. **Hot Reload During Development:**
    
    For Elixir development:
    ```bash
    npx dhti-cli elixir dev -d <elixir-path> -n <elixir-name>
    ```
    
    For Conch development:
    ```bash
    npx dhti-cli conch dev -d <conch-path> -n <conch-name>
    ```
    
    These commands copy updated files to running containers and restart them.

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

## Example Workflow

See the `examples/` directory for complete end-to-end scenarios demonstrating:
- Creating a glycemic control application
- Building a medication interaction checker
- Implementing a clinical decision support system

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

- This skill orchestrates multiple other skills (elixir-generator, conch-generator)
- The local directory installation feature (`-l` flag) is essential for this workflow
- Always use dry-run mode first to verify commands
- Generated projects can be version controlled and shared
- Docker images can be pushed to registries for deployment
- The skill creates a complete, production-ready DHTI application

## Related Skills

- **elixir-generator**: For generating standalone elixirs
- **conch-generator**: For generating standalone conches

## Support

For more information about DHTI:
- [DHTI Repository](https://github.com/dermatologist/dhti)
- [DHTI Wiki](https://github.com/dermatologist/dhti/wiki)
- [DHTI Documentation](https://dermatologist.github.io/dhti/)
