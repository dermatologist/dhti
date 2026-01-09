Using the working folder ~/gitcola/temp and the skills available to you Please create a DHTI elixir in the packages folder that:
- Search for any Blood sugar and HbA1c observations for a patient given their patient ID for the last 6 months.
- Use the following knowledgebase to interpret the results: https://ngsp.org/A1ceAG.asp
- Provide patient recommendations based on the interpreted results according to the above knowledgebase.
- The name of the service (project slug) is dhti_elixir_glycemic and project name is dhti-elixir-glycemic.
Next create a DHTI conch also in the packages folder that has the following features.:
* This widget will be displayed in the patient chart, conditions tab.
* This widget will use dhti_elixir_glycemic service to get GenAI outputs, by default. But the user can configure a different DHTI service name via the configuration schema.
* If a patient in context is diabetic (i.e., has a Condition resource with code SNOMED CT 44054006), the widget will display the latest HbA1c and Blood Sugar observations for the patient, along with GenAI interpretations and recommendations from the dhti_elixir_glycemic service.
Finally use start-dhti skill to spin up dhti with only openmrs and langserve modules, install the new elixir and conch that you created and start the docker containers.
