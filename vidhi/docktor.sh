#!/bin/bash
npx dhti-cli compose reset
npx dhti-cli compose add -m langserve -m docktor
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-achat -s packages/agent_chat
npx dhti-cli docker -n dhti/genai-test:2.0 -t elixir
npx dhti-cli docker -u
npx dhti-cli docktor install my-pipeline --image mcp/sequentialthinking:latest --model-path /tmp

# Configure LLMs and hyperparameters as needed
npx dhti-cli docker bootstrap -f bootstrap.py
# Edit bootstrap.py to set preferred LLMs and hyperparameters, then run the above command again to apply changes

# Testing in CDS-Hooks sandbox
#! Remember to click on the application link rather than the final display link
npx dhti-cli elixir start -n dhti-elixir-achat

# Testing in OpenMRS EMR
npx dhti-cli conch install # (Optional) if you have not performed this step before.
npx dhti-cli conch start -s packages/esm-chatbot-agent
# Finally, add the following configuration to your OpenMRS
# Alternatively, you can click on the wrench icon in the top left navbar to pull up implementers tools.
# Click on configuration tab and paste the following JSON:
# {
#     "@openmrs/esm-chatbot-agent": {
#         "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_achat/cds-services/dhti-service"
#     }
# }

# Finally remove docker containers if no longer needed
npx dhti-cli docker -d