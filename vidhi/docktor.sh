#!/bin/bash
dhti-cli compose reset
dhti-cli compose add -m langserve -m docktor
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-achat -s packages/agent_chat
dhti-cli docker -n dhti/genai-test:2.0 -t elixir
dhti-cli docker -u
dhti-cli docktor install my-pipeline --image mcp/sequentialthinking:latest --model-path /tmp
dhti-cli conch install -s packages/esm-chatbot-agent
dhti-cli conch start -s packages/esm-chatbot-agent


# Finally, add the following configuration to your OpenMRS
# Alternatively, you can click on the wrench icon in the top left navbar to pull up implementers tools.
# Click on configuration tab and paste the following JSON:
# {
#     "@openmrs/esm-chatbot-agent": {
#         "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_achat/cds-services/dhti-service"
#     }
# }
