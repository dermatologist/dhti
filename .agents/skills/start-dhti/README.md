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

Elixir Requirements (build using elixir-generator skill):
- Monitor blood glucose and HbA1c levels for diabetic patients
- Query FHIR Observation resources for the last 6 months
- Use LangChain to analyze trends and provide recommendations
- Project name: dhti-elixir-glycemic
- Project slug: dhti_elixir_glycemic

Conch Requirements (build using conch-generator skill):
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
- Sufficient disk space for Docker images (~5-10 GB)


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

