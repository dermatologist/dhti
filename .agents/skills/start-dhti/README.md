# DHTI Start Server Skill

This directory contains an AI agent skill for orchestrating complete DHTI application development from generation to deployment.

## Overview

The **start-dhti** skill is an orchestration skill that combines:
- Local directory installation (new `-l` flag feature)
- DHTI server setup and deployment

This skill enables end-to-end development of GenAI healthcare applications within a single workflow.

## Files

- **SKILL.md**: The main skill definition with detailed step-by-step instructions
- **examples/**: Directory containing complete workflow examples
  - **quick-start.md**: A simple example of generating and starting a DHTI application.

## How It Works

When an AI agent uses this skill, it will:

1. **Set Up Infrastructure**:
   - Create Docker Compose with necessary services
   - Configure OpenMRS, LangServe, FHIR server, etc.

2. **Install from Local Directories**:
   - Use new `-l` flag to install generated elixir from local directory
   - Use new `-l` flag to install generated conch from local directory
   - Build Docker images for both components

3. **Start and Verify**:
   - Launch all services with Docker Compose
   - Verify integration and functionality
   - Provide access instructions

4. **Facilitate Hot Reloading**:
   - Allow developers to make changes to elixir and conch code
   - Restart services to see updates without rebuilding everything

## Usage

### Basic Invocation

```
Please use the start-dhti skill to generate, install, and start the complete application.
```

## Prerequisites

Users of this skill need:
- Node.js >= 18.0.0
- Docker and Docker Compose
- Python 3.x (Optional for local development and testing)
- Sufficient disk space for Docker images (~5-10 GB)


## Troubleshooting

Common issues:

1. **Generation fails**:
   - Check requirements are clear and specific
   - Ensure project names follow conventions
   - Verify network connectivity for cookiecutter

2. **Installation fails**:
   - Verify generated directories exist
   - Check paths are correct (absolute paths recommended)
   - Ensure directory structure matches expected format

3. **Services don't start**:
   - Check port availability (80, 8080, 8000)
   - Verify Docker has sufficient resources
   - Check Docker logs for specific errors

## Cleanup

To stop and remove all containers:

```bash
npx dhti-cli docker -d
```

