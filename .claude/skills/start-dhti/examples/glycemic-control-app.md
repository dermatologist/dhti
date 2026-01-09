# Example: Glycemic Control Application

This example demonstrates the complete workflow of using the start-dhti skill to create a diabetes monitoring application with both backend and frontend components.

## Overview

**Application Name**: DHTI Glycemic Control Advisor

**Purpose**: Monitor and analyze blood glucose and HbA1c levels for diabetic patients, providing AI-powered insights and recommendations.

## Requirements

### Elixir (Backend) Requirements

**Project Name**: dhti-elixir-glycemic  
**Project Slug**: dhti_elixir_glycemic

**Functionality**:
- Query FHIR Observation resources for diabetic patients
- Retrieve blood glucose readings (LOINC: 2339-0) from the last 6 months
- Retrieve HbA1c readings (LOINC: 4548-4) from the last 6 months
- Analyze trends using LangChain
- Provide clinical recommendations based on:
  - ADA (American Diabetes Association) guidelines
  - Recent trends in glucose control
  - Medication history (if available)
- Return structured response with:
  - Current glycemic control status (good/fair/poor)
  - Trend analysis (improving/stable/worsening)
  - Specific recommendations
  - Risk factors identified

**FHIR Resources**:
- Observation (for glucose and HbA1c)
- Patient (for demographics)
- Condition (for diabetes diagnosis confirmation)
- MedicationRequest (optional, for medication history)

**Technical Details**:
- Use dhti-elixir-base for FHIR integration
- Implement LangChain chain with structured output
- Include proper error handling for missing data
- Support configurable LLM via environment variables

### Conch (Frontend) Requirements

**Project Name**: openmrs-esm-dhti-glycemic

**Functionality**:
- Display as a widget in the patient chart, conditions tab
- Only show for patients with diabetes diagnosis (SNOMED CT: 44054006)
- Display latest HbA1c and blood glucose readings with timestamps
- Show historical trend chart (line graph, last 6 months)
- Display AI-generated interpretation and recommendations
- Provide "refresh" button to trigger new analysis
- Show loading states during DHTI service calls

**UI Components**:
- Header: "Glycemic Control Advisor"
- Diagnosis check: Verify diabetes condition exists
- Data display: Latest readings with normal ranges
- Trend visualization: Simple line chart
- AI insights panel: Recommendations and risk factors
- Actions: Refresh button, export data (optional)

**DHTI Service Integration**:
- Service name: `dhti_elixir_glycemic` (configurable)
- Use `useDhti.ts` hook from template
- Pass patient UUID and context
- Handle service errors gracefully

**Design**:
- Follow Carbon Design System patterns
- Use OpenMRS color scheme
- Responsive layout
- Accessible (ARIA labels, keyboard navigation)

## Invocation

To use the start-dhti skill for this application:

```
I need to create a complete DHTI application for glycemic control monitoring.

Elixir Requirements:
- Project name: dhti-elixir-glycemic
- Project slug: dhti_elixir_glycemic
- Query FHIR Observation resources for diabetic patients
- Retrieve blood glucose readings (LOINC: 2339-0) from the last 6 months
- Retrieve HbA1c readings (LOINC: 4548-4) from the last 6 months
- Analyze trends using LangChain and provide clinical recommendations
- Follow ADA guidelines for diabetes management
- Return structured response with glycemic control status, trends, and recommendations

Conch Requirements:
- Project name: openmrs-esm-dhti-glycemic
- Display as widget in patient chart conditions tab
- Only show for patients with diabetes (SNOMED CT: 44054006)
- Show latest HbA1c and glucose readings
- Display trend chart for last 6 months
- Show AI-generated recommendations
- Use dhti_elixir_glycemic service (configurable)
- Include refresh button and loading states

Please use the start-dhti skill to build this complete application.
```

## Expected Workflow

### Phase 1: Elixir Generation (5-10 minutes)

The agent will:
1. Run cookiecutter to scaffold dhti-elixir-glycemic
2. Study reference implementations
3. Implement chain.py with:
   - FHIR search for Observation resources
   - Filtering by LOINC codes (2339-0, 4548-4)
   - Date range filtering (last 6 months)
   - LangChain integration for analysis
   - Structured output generation
4. Implement bootstrap.py with:
   - Configuration for FHIR endpoint
   - LLM settings
   - CDS hook discovery
5. Write tests for:
   - FHIR queries
   - Data processing
   - Chain execution
6. Update README with usage instructions

**Generated Files Location**: `./dhti-elixir-glycemic/`

### Phase 2: Conch Generation (5-10 minutes)

The agent will:
1. Clone openmrs-esm-dhti-template
2. Rename to openmrs-esm-dhti-glycemic
3. Implement glycemic-widget.component.tsx with:
   - Patient context detection
   - Diabetes condition check (SNOMED CT: 44054006)
   - FHIR observations fetch
   - DHTI service integration
   - Trend chart rendering
   - Loading and error states
4. Update routes.json:
   - Register extension in conditions tab
5. Update config-schema.ts:
   - Add dhtiServiceName configuration
6. Write tests for:
   - Component rendering
   - Diabetes check logic
   - Service integration
7. Update README with usage instructions

**Generated Files Location**: `./openmrs-esm-dhti-glycemic/`

### Phase 3: Infrastructure Setup (2-3 minutes)

```bash
# Create compose configuration
npx dhti-cli compose add -m openmrs -m langserve -m redis

# Verify configuration
npx dhti-cli compose read
```

This creates `~/dhti/docker-compose.yml` with:
- OpenMRS
- LangServe
- FHIR server (HAPI)
- Redis (for caching/vector store)
- PostgreSQL databases
- Nginx gateway

### Phase 4: Install Elixir (2-3 minutes)

```bash
# Install from local directory
npx dhti-cli elixir install \
  -l /home/user/projects/dhti-elixir-glycemic \
  -n dhti-elixir-glycemic

# Build Docker image
npx dhti-cli docker -n myregistry/dhti-glycemic-backend:1.0 -t elixir
```

This:
- Copies elixir to `~/dhti/elixir/`
- Updates pyproject.toml with local path dependency
- Updates server.py with import and routes
- Builds Docker image with installed elixir

### Phase 5: Install Conch (2-3 minutes)

```bash
# Install from local directory
npx dhti-cli conch install \
  -l /home/user/projects/openmrs-esm-dhti-glycemic \
  -n openmrs-esm-dhti-glycemic

# Build Docker image
npx dhti-cli docker -n myregistry/dhti-glycemic-frontend:1.0 -t conch
```

This:
- Copies conch to `~/dhti/conch/`
- Updates importmap.json and spa-assemble-config.json
- Updates routes.registry.json
- Builds Docker image with installed conch

### Phase 6: Start Services (3-5 minutes)

```bash
# Start all containers
npx dhti-cli docker -u

# Monitor startup
docker compose logs -f
```

Wait for services to initialize. OpenMRS can take 2-3 minutes on first startup.

### Phase 7: Verify and Test (5-10 minutes)

1. **Access OpenMRS**:
   - Navigate to `http://localhost/openmrs/spa/home`
   - Login: admin / Admin123

2. **Find the Widget**:
   - Click on "Patient Chart" from the menu
   - Search for a patient (or register a test patient)
   - Navigate to the "Conditions" tab
   - Look for "Glycemic Control Advisor" widget

3. **Create Test Data** (if needed):
   - Add diabetes diagnosis (SNOMED CT: 44054006)
   - Add HbA1c observation (LOINC: 4548-4)
   - Add blood glucose observations (LOINC: 2339-0)

4. **Test the Widget**:
   - Widget should appear only for diabetic patients
   - Should show latest readings
   - Click refresh to trigger analysis
   - Should display AI recommendations

5. **Check Backend**:
   - Navigate to `http://localhost:8000/docs`
   - Find `/langserve/dhti_elixir_glycemic` endpoint
   - Test API directly using Swagger UI

6. **Check Logs**:
   ```bash
   docker compose logs dhti-langserve-1
   docker compose logs dhti-frontend-1
   ```

## Expected Output

### Elixir Output Structure

```json
{
  "control_status": "fair",
  "trend": "stable",
  "latest_hba1c": {
    "value": 7.2,
    "unit": "%",
    "date": "2024-01-15"
  },
  "latest_glucose": {
    "value": 145,
    "unit": "mg/dL",
    "date": "2024-01-20"
  },
  "recommendations": [
    "HbA1c of 7.2% indicates fair glycemic control.",
    "Consider adjusting medication dosage to achieve target <7.0%.",
    "Continue regular monitoring and lifestyle modifications."
  ],
  "risk_factors": [
    "Slightly elevated HbA1c"
  ]
}
```

### Conch Display

**Glycemic Control Advisor**

**Current Status**: Fair Control

**Latest Readings**:
- HbA1c: 7.2% (Jan 15, 2024) - Target: <7.0%
- Blood Glucose: 145 mg/dL (Jan 20, 2024) - Target: 70-130 mg/dL

**Trend**: Stable over last 6 months

**Recommendations**:
- HbA1c of 7.2% indicates fair glycemic control
- Consider adjusting medication dosage to achieve target <7.0%
- Continue regular monitoring and lifestyle modifications

[Refresh] [Export Data]

## Development Workflow

During development, use dev mode for rapid iteration:

```bash
# Make changes to elixir
cd dhti-elixir-glycemic
# Edit chain.py or bootstrap.py

# Copy to running container
npx dhti-cli elixir dev \
  -d /home/user/projects/dhti-elixir-glycemic \
  -n dhti-elixir-glycemic

# Make changes to conch
cd ../openmrs-esm-dhti-glycemic
# Edit components

# Build and copy to running container
npx dhti-cli conch dev \
  -d /home/user/projects/openmrs-esm-dhti-glycemic \
  -n openmrs-esm-dhti-glycemic
```

## Cleanup

```bash
# Stop and remove containers
npx dhti-cli docker -d

# Remove generated directories
rm -rf dhti-elixir-glycemic openmrs-esm-dhti-glycemic

# Clean up DHTI installation
rm -rf ~/dhti
```

## Next Steps

1. **Version Control**:
   - Create Git repositories for elixir and conch
   - Commit and push to GitHub
   - Tag releases

2. **Refinement**:
   - Adjust prompts and chain logic
   - Improve UI/UX based on feedback
   - Add more sophisticated analysis

3. **Testing**:
   - Add more comprehensive tests
   - Test with real patient data
   - Performance testing

4. **Deployment**:
   - Push Docker images to registry
   - Deploy to staging environment
   - Production deployment

## Notes

- This example uses mock/test data during development
- Always test with synthetic data before real patient data
- Follow HIPAA/GDPR guidelines for patient data
- Use appropriate LLM models that don't send data to external servers
- Consider using local Ollama for privacy-sensitive deployments

## Troubleshooting

**Widget doesn't appear**:
- Check patient has diabetes diagnosis
- Verify routes.json is correctly configured
- Check browser console for errors

**No AI recommendations**:
- Check LangServe logs for errors
- Verify FHIR server has patient data
- Test elixir endpoint directly

**Slow performance**:
- Check LLM response times
- Consider caching results
- Use Redis for vector store

**FHIR queries return no data**:
- Verify LOINC codes are correct
- Check date range is appropriate
- Ensure patient has observations

## Success Criteria

✓ Both elixir and conch generated successfully  
✓ All tests passing  
✓ Docker images built  
✓ Services running without errors  
✓ Widget visible in OpenMRS for diabetic patients  
✓ AI recommendations displayed correctly  
✓ Data flows from FHIR → Elixir → Conch  
✓ Documentation complete
