PHASE 1
========================
Using elixir-generator skill create a DHTI elixir in the packages folder that:
- Search for any Blood sugar and HbA1c observations for a patient given their patient ID for the last 6 months.
- Use the following knowledgebase to interpret the results: https://ngsp.org/A1ceAG.asp
- Provide patient recommendations based on the interpreted results according to the above knowledgebase.
- The name of the service (project slug) is dhti_elixir_glycemic and project name is dhti-elixir-glycemic.

PHASE 2
========================
Using conch-generator skill create a DHTI conch widget in the packages folder that:
* Widget Name: openmrs-esm-dhti-glycemic
* This widget will be displayed in the patient chart, conditions tab.
* This widget will use dhti_elixir_glycemic service to get GenAI outputs, by default. But the user can configure a different DHTI service name via the configuration schema.
* If a patient in context is diabetic (i.e., has a Condition resource with code SNOMED CT 44054006), the widget will display the latest HbA1c and Blood Sugar observations for the patient, along with GenAI interpretations and recommendations from the dhti_elixir_glycemic service.

PHASE 3
========================
Finally use start-dhti skill to spin up DHTI with only openmrs and langserve modules.
Install the elixir from the directory ~/dhti/packages/dhti_elixir_glycemic.
Install the conch from the directory ~/dhti/packages/openmrs-esm-dhti-glycemic.
Start the docker containers.
Verify everything is working end to end.
