#!/bin/bash
npx dhti-cli compose reset
npx dhti-cli compose add -m langserve -m redis
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -b debug -n dhti-elixir-upload -s packages/upload_file
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -b debug -n dhti-elixir-srag -s packages/simple_rag
npx dhti-cli docker -n dhti/genai-test:3.0 -t elixir
npx dhti-cli docker -u

# Testing in OpenMRS EMR
npx dhti-cli conch install -s packages/esm-chatbot-agent -s packages/esm-dhti-upload
npx dhti-cli conch start -s packages/esm-chatbot-agent -s packages/esm-dhti-upload
# Finally, add the following configuration to your OpenMRS
# Alternatively, you can click on the wrench icon in the top left navbar to pull up implementers tools.
# Click on configuration tab and paste the following JSON:
# {
#     "@openmrs/esm-chatbot-agent": {
#         "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_srag/cds-services/dhti-service"
#     }
# }


# Testing in CDS-Hooks sandbox
#! Remember to click on the application link rather than the final display link
npx dhti-cli elixir start -n dhti-elixir-srag