# Example: Basic Elixir Request

## Simple Request Format

When requesting a new DHTI elixir, provide the following information:

### Minimum Required Information

```
Please create a DHTI elixir that:
- [Describe the main functionality]
- [Specify any data sources or knowledgebases to use]
- [Indicate the project name and slug]
```

### Optional Information

- **Author Name**: Your name (default: "Developer")
- **Email**: Your email address (default: "developer@example.com")
- **GitHub Handle**: Your GitHub username (default: "developer")
- **License**: Desired open source license (default: "Not open source")

## Example 1: Simple Patient Data Query

```
Please create a DHTI elixir that:
- Retrieves all medication orders for a patient
- Checks for potential drug interactions
- The project slug is dhti_elixir_drugcheck and project name is dhti-elixir-drugcheck

Author: Dr. John Doe
Email: john.doe@hospital.org
License: Apache 2.0
```

## Example 2: Clinical Decision Support

```
Please create a DHTI elixir that:
- Monitors vital signs (blood pressure, heart rate, temperature) for ICU patients
- Alerts when values exceed clinical thresholds
- Provides trending analysis over 24 hours
- The project slug is dhti_elixir_vitals and project name is dhti-elixir-vitals

Author: Clinical AI Team
Email: ai-team@medical.edu
GitHub Handle: clinicalai
```

## Example 3: Using External Knowledgebase

```
Please create a DHTI elixir that:
- Analyzes lab results for kidney function (creatinine, GFR, BUN)
- Uses clinical guidelines from https://www.kidney.org/professionals/guidelines
- Provides stage-based recommendations for chronic kidney disease
- The project slug is dhti_elixir_renal and project name is dhti-elixir-renal

License: MIT
```

## Key Components to Specify

1. **Functionality**: What the elixir should do
2. **Data Sources**: Which FHIR resources to query (Observation, MedicationRequest, etc.)
3. **Knowledgebase**: External references or guidelines to incorporate
4. **Output**: Expected format of recommendations or alerts
5. **Project Naming**: Consistent naming (dhti-elixir-* / dhti_elixir_*)

## FHIR Resources Commonly Used

- **Observation**: Lab results, vital signs, clinical measurements
- **MedicationRequest**: Medication orders and prescriptions
- **Condition**: Diagnoses and health conditions
- **Patient**: Patient demographics
- **Encounter**: Hospital visits and interactions
- **Procedure**: Medical procedures performed
- **DiagnosticReport**: Imaging and diagnostic test reports

## Tips for Writing Requests

1. **Be Specific**: Clearly state what clinical problem you're solving
2. **Name FHIR Resources**: Mention which FHIR resource types you need
3. **Time Ranges**: Specify if you need historical data (e.g., "last 6 months")
4. **Thresholds**: Include any clinical thresholds or decision points
5. **References**: Link to clinical guidelines or knowledge sources
6. **Naming**: Always specify the project name and slug following the pattern

## What Happens Next

Once you provide your request, the agent will:

1. Set up the development environment with `uv`
2. Run cookiecutter to scaffold the project
3. Study reference implementations
4. Implement your requested functionality
5. Create tests for the implementation
6. Document the elixir in README
7. Ensure FHIR integration works correctly

The generated elixir will be ready to install into DHTI using:

```bash
npx dhti-cli elixir install -g <your-repo-url> -n <project-slug> -b main
```
