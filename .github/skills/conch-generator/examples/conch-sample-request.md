# Example: Glycemic Control Widget: This example demonstrates how to use the OpenMRS Conch Agent Skill to create a patient-specific widget that integrates GenAI capabilities.

* Generate a glycemic-advisor conch.
* It will display diabetes-related observations for the patient in context with GenAI interpretations and recommendations.
* This widget will be displayed in the patient chart, conditions tab.
* This widget will use `dhti_elixir_glycemic_advisor` service to get GenAI outputs, by default. But the user can configure a different DHTI service name via the configuration schema.
* If a patient in context is diabetic (i.e., has a Condition resource with code SNOMED CT 44054006), the widget will display the latest HbA1c and Blood Sugar observations for the patient, along with GenAI interpretations and recommendations from the `dhti_elixir_glycemic_advisor` service.
