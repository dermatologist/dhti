# Example: Glycemic Monitoring Elixir

## User Request

Please create a DHTI elixir that:

- Search for any Blood sugar and HbA1c observations for a patient given their patient ID for the last 6 months.
- Use the following knowledgebase to interpret the results: https://ngsp.org/A1ceAG.asp
- Provide patient recommendations based on the interpreted results according to the above knowledgebase.
- The name of the service (project slug) is dhti_elixir_glycemic and project name is dhti-elixir-glycemic.

## Project Details

- **Author**: Dr. Jane Smith
- **Email**: jane.smith@example.com
- **GitHub Handle**: janesmith
- **License**: MIT License

## Expected Behavior

The generated elixir should:

1. **FHIR Search Implementation**:
   - Query for Observation resources with LOINC codes for blood glucose and HbA1c
   - Filter observations for the last 6 months for the specified patient
   - Use FHIR search parameters: `patient`, `code`, `date`

2. **Data Interpretation**:
   - Parse the NGSP HbA1c/Average Glucose correlation table
   - Map HbA1c values to estimated average glucose levels
   - Assess glycemic control based on standard thresholds

3. **Clinical Recommendations**:
   - Generate personalized recommendations based on:
     - Current HbA1c level
     - Glucose variability
     - Trend over the 6-month period
   - Provide actionable advice for patients and clinicians

4. **CDS Hooks Integration**:
   - Expose service via CDS Hooks discovery endpoint
   - Respond to `order-select` hook triggers
   - Return cards with recommendations and alerts

## Technical Requirements

- Use dhti-elixir-base for FHIR client functionality
- Implement as a LangChain chain (DhtiChain)
- Support configuration via environment variables
- Include comprehensive unit tests
- Mock FHIR server responses in tests
- Document FHIR resource queries and response handling

## Sample FHIR Query

```python
# Search for HbA1c observations
observations = fhir_client.search(
    resource_type="Observation",
    search_params={
        "patient": patient_id,
        "code": "4548-4",  # LOINC code for HbA1c
        "date": f"ge{six_months_ago}",
        "_sort": "-date"
    }
)
```

## Expected Output Structure

```json
{
  "cards": [
    {
      "summary": "Glycemic Control Assessment",
      "indicator": "info",
      "detail": "Current HbA1c: 7.2% (eAG: 160 mg/dL)",
      "source": {
        "label": "DHTI Glycemic Elixir"
      },
      "suggestions": [
        {
          "label": "Review recommendations",
          "actions": [
            {
              "type": "create",
              "description": "Patient recommendations based on glycemic trends"
            }
          ]
        }
      ]
    }
  ]
}
```
