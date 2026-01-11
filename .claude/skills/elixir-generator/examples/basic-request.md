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
- Uses clinical guidelines from https://r.jina.ai/https://www.kidney.org/professionals/guidelines
- Provides stage-based recommendations for chronic kidney disease
- The project slug is dhti_elixir_renal and project name is dhti-elixir-renal

License: MIT
```

