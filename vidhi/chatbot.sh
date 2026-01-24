#!/bin/bash
#* A chatbot that answers questions about a patient's medical record!
npx dhti-cli compose reset
npx dhti-cli compose add -m langserve
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-schat -s packages/simple_chat
npx dhti-cli docker -n dhti/genai-test:1.0 -t elixir
npx dhti-cli docker -u

# Configure LLMs and hyperparameters as needed
npx dhti-cli docker bootstrap -f bootstrap.py
# Edit bootstrap.py to set preferred LLMs and hyperparameters, then run the above command again to apply changes

# Testing in CDS-Hooks sandbox
#! Remember to click on the application link rather than the final display link
npx dhti-cli elixir start -n dhti-elixir-schat

# Testing in OpenMRS EMR
npx dhti-cli conch install -s packages/esm-chatbot-agent
npx dhti-cli conch start -s packages/esm-chatbot-agent
# Open OpenMRS and login with admin/Admin123
# Click on search 🔍 and click on any patient record.
# You will see a Chatbot tab in the patient record view at the bottom.
# Finally, add the following configuration to your OpenMRS (If you have used a different elixir before)
# Alternatively, you can click on the wrench icon in the top left navbar to pull up implementers tools.
# Click on configuration tab and paste the following JSON:
# {
#     "@openmrs/esm-chatbot-agent": {
#         "dhtiRoute": "http://localhost:8001/langserve/dhti-elixir-schat/cds-services/dhti-service"
#     }
# }

# Finally remove docker containers if no longer needed
npx dhti-cli docker -d