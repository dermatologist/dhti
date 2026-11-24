PHASE 1
========================
Using elixir-generator skill:
* Generate a glycemic_advisor elixir.
* Search for any Blood sugar and HbA1c observations for a patient given their patient ID for the last 6 months.
* Read and internalize the glycemic control goals from: https://r.jina.ai/https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic
* Based on the observations and glycemic goals, generate personalized glycemic advice for the patient using an LLM.


PHASE 2
========================
Using conch-generator skill:
* Generate a glycemic-advisor conch.
* It will display diabetes-related observations for the patient in context with GenAI interpretations and recommendations.
* This widget will be displayed in the patient chart, summary tab.
* This widget will use `glycemic_advisor` DHTI elixir service to get GenAI outputs, by default.
* If a patient in context is diabetic (i.e., has a Condition resource with code SNOMED CT 44054006), the widget will display the latest HbA1c and Blood Sugar observations for the patient, along with GenAI interpretations and recommendations from the `glycemic_advisor` service.


PHASE 3
========================
Using start-dhti skill to spin up DHTI with langserve module only.
Install the glycemic_advisor elixir.
Install the esm-glycemic-advisor conch.
Start the docker containers.
Verify everything is working end to end.
