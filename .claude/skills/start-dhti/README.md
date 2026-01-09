# DHTI Start Server Skill

This directory contains an AI agent skill for orchestrating complete DHTI application development from generation to deployment.

## Overview

The **start-dhti** skill is an orchestration skill that combines:
- Elixir generation (backend GenAI logic)
- Conch generation (frontend UI components)
- Local directory installation (new `-l` flag feature)
- DHTI server setup and deployment

This skill enables end-to-end development of GenAI healthcare applications within a single workflow.

## Files

- **SKILL.md**: The main skill definition with detailed step-by-step instructions
- **examples/**: Directory containing complete workflow examples
  - **glycemic-control-app.md**: Example of creating a diabetes monitoring application
  - **quick-start.md**: Quick reference guide for common scenarios

## How It Works

When an AI agent uses this skill, it will:

1. **Generate Backend (Elixir)**: 
   - Invoke elixir-generator skill to create Python-based GenAI backend
   - Implements FHIR integration and clinical logic
   - Creates LangServe-compatible service

2. **Generate Frontend (Conch)**:
   - Invoke conch-generator skill to create OpenMRS microfrontend
   - Implements patient-context-aware UI
   - Integrates with DHTI service

3. **Set Up Infrastructure**:
   - Create Docker Compose with necessary services
   - Configure OpenMRS, LangServe, FHIR server, etc.

4. **Install from Local Directories**:
   - Use new `-l` flag to install generated elixir from local directory
   - Use new `-l` flag to install generated conch from local directory
   - Build Docker images for both components

5. **Start and Verify**:
   - Launch all services with Docker Compose
   - Verify integration and functionality
   - Provide access instructions

## Usage

### Basic Invocation

```
I need to create a complete DHTI application with the following requirements:

Elixir (Backend):
- [Describe the GenAI functionality, FHIR resources, clinical logic]

Conch (Frontend):
- [Describe the UI components, patient context, user interactions]

Please use the start-dhti skill to generate, install, and start the complete application.
```

### With Specific Requirements

```
Create a DHTI application for glycemic control monitoring:

Elixir Requirements:
- Monitor blood glucose and HbA1c levels for diabetic patients
- Query FHIR Observation resources for the last 6 months
- Use LangChain to analyze trends and provide recommendations
- Project name: dhti-elixir-glycemic
- Project slug: dhti_elixir_glycemic

Conch Requirements:
- Display glycemic control widget in patient chart conditions tab
- Show latest HbA1c and blood glucose readings
- Display AI-generated interpretations and recommendations
- Project name: openmrs-esm-dhti-glycemic
- Only show for patients with diabetes diagnosis (SNOMED CT 44054006)

Please use the start-dhti skill to build this application.
```

## Prerequisites

Users of this skill need:
- Node.js >= 18.0.0
- Docker and Docker Compose
- Python 3.x
- `uv` package manager (installed automatically if missing)
- Sufficient disk space for Docker images (~5-10 GB)

## What Gets Created

After running this skill, you'll have:

1. **Generated Elixir Directory**: 
   - Complete Python project with LangServe app
   - FHIR integration code
   - Tests and documentation
   - Location: `./generated-elixir/` (or specified path)

2. **Generated Conch Directory**:
   - Complete OpenMRS ESM module
   - React components with patient context
   - Tests and documentation
   - Location: `./generated-conch/` (or specified path)

3. **DHTI Installation**:
   - Docker Compose configuration at `~/dhti/docker-compose.yml`
   - Installed elixir at `~/dhti/elixir/`
   - Installed conch at `~/dhti/conch/`
   - Built Docker images

4. **Running Services**:
   - OpenMRS at `http://localhost/openmrs/spa/`
   - LangServe backend
   - FHIR server
   - Additional services (based on compose config)

## Key Features

### Local Directory Installation

This skill leverages the new local directory installation feature:

```bash
# Install elixir from local directory
npx dhti-cli elixir install -l /path/to/elixir -n dhti-elixir-name

# Install conch from local directory
npx dhti-cli conch install -l /path/to/conch -n openmrs-esm-dhti-name
```

This allows the skill to:
- Generate projects in isolated directories
- Install them into DHTI without Git repositories
- Support rapid iteration and testing
- Enable local development workflows

### Dry-Run Support

All commands support dry-run mode for preview:

```bash
npx dhti-cli elixir install -l /path -n name --dry-run
npx dhti-cli conch install -l /path -n name --dry-run
```

### Development Mode

For rapid development iteration:

```bash
# Copy updated elixir files to running container
npx dhti-cli elixir dev -d /path/to/elixir -n elixir-name

# Copy updated conch files to running container
npx dhti-cli conch dev -d /path/to/conch -n conch-name
```

## Example Workflows

See the `examples/` directory for:

1. **glycemic-control-app.md**: Complete diabetes monitoring application
   - Backend: Monitors HbA1c and glucose levels
   - Frontend: Patient chart widget with AI recommendations
   - Full setup and testing instructions

2. **quick-start.md**: Quick reference for common patterns
   - Minimal elixir + conch setup
   - Common Docker Compose configurations
   - Testing and verification steps

## Integration with Other Skills

This skill orchestrates:

1. **elixir-generator skill**:
   - Creates backend GenAI logic
   - Implements FHIR integration
   - Provides LangServe endpoints

2. **conch-generator skill**:
   - Creates frontend UI components
   - Implements OpenMRS integration
   - Provides patient-context-aware interfaces

3. **dhti-cli commands**:
   - `compose add`: Configure infrastructure
   - `elixir install`: Install backend from local directory (new `-l` flag)
   - `conch install`: Install frontend from local directory (new `-l` flag)
   - `docker`: Build images and start services

## Typical Timeline

For a complete workflow:
- Elixir generation: 5-15 minutes
- Conch generation: 5-15 minutes
- Infrastructure setup: 2-5 minutes
- Installation and building: 5-10 minutes
- Service startup: 3-5 minutes
- **Total: 20-50 minutes** (varies by complexity)

## Output Verification

After completion, verify:

1. **Services Running**:
   ```bash
   docker ps
   ```
   Should show: OpenMRS, LangServe, FHIR server, gateway, database

2. **OpenMRS Access**:
   - Navigate to `http://localhost/openmrs/spa/home`
   - Login with admin/Admin123
   - See your conch in the interface

3. **Elixir Endpoints**:
   - Check LangServe docs at `http://localhost:8000/docs`
   - Verify your elixir endpoint is listed

4. **Integration**:
   - Use the conch to trigger elixir calls
   - Verify data flows correctly
   - Check Docker logs for errors

## Troubleshooting

Common issues:

1. **Skill invocation fails**:
   - Ensure elixir-generator and conch-generator skills are available
   - Check that all prerequisites are installed
   - Verify Docker is running

2. **Generation fails**:
   - Check requirements are clear and specific
   - Ensure project names follow conventions
   - Verify network connectivity for cookiecutter

3. **Installation fails**:
   - Verify generated directories exist
   - Check paths are correct (absolute paths recommended)
   - Ensure directory structure matches expected format

4. **Services don't start**:
   - Check port availability (80, 8080, 8000)
   - Verify Docker has sufficient resources
   - Check Docker logs for specific errors

## Cleanup

To stop and remove all containers:

```bash
npx dhti-cli docker -d
```

To remove generated directories:

```bash
rm -rf ./generated-elixir ./generated-conch
```

To reset DHTI installation:

```bash
rm -rf ~/dhti
```

## Support and Resources

- [DHTI Documentation](https://dermatologist.github.io/dhti/)
- [DHTI Wiki](https://github.com/dermatologist/dhti/wiki)
- [OpenMRS O3 Docs](https://o3-docs.openmrs.org/)
- [LangServe Docs](https://python.langchain.com/docs/langserve/)

## Contributing

To improve this skill:
1. Add more examples to `examples/` directory
2. Document common patterns and best practices
3. Add troubleshooting tips from real-world usage
4. Update prerequisites as the ecosystem evolves

## Version History

- **v1.0.0**: Initial release with local directory installation support
  - Integrated elixir-generator and conch-generator
  - Added `-l` flag support for local installations
  - Complete end-to-end workflow
