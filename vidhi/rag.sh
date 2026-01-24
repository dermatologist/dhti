#!/bin/bash
npx dhti-cli compose reset
npx dhti-cli compose add -m langserve -m redis
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-upload -s packages/upload_file
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-srag -s packages/simple_rag
npx dhti-cli docker -n dhti/genai-test:3.0 -t elixir
npx dhti-cli docker -u

# Configure LLMs and hyperparameters as needed
npx dhti-cli docker bootstrap -f bootstrap.py
# Edit bootstrap.py to set preferred LLMs and hyperparameters, then run the above command again to apply changes

# Testing in CDS-Hooks sandbox
#! Remember to click on the application link rather than the final display link
# You cannot upload files in CDS-Hooks sandbox, so only testing RAG functionality here
npx dhti-cli elixir start -n dhti-elixir-srag

# Testing in OpenMRS EMR
npx dhti-cli conch install # (Optional) if you have not performed this step before.
npx dhti-cli conch start -s packages/esm-chatbot-agent -s packages/esm-dhti-upload
# Finally, add the following configuration to your OpenMRS
# Alternatively, you can click on the wrench icon in the top left navbar to pull up implementers tools.
# Click on configuration tab and paste the following JSON:
# {
#     "@openmrs/esm-chatbot-agent": {
#         "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_srag/cds-services/dhti-service"
#     }
# }

# Finally remove docker containers if no longer needed
npx dhti-cli docker -d