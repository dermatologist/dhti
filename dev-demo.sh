#!/bin/bash
rm -rf ~/dhti
dhti-cli compose add -m langserve -m redis
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -b debug -n dhti-elixir-schat -s packages/simple_chat
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -b debug -n dhti-elixir-upload -s packages/upload_file
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -b debug -n dhti-elixir-srag -s packages/simple_rag
dhti-cli docker -n yourdockerhandle/genai-test:3.0 -t elixir
dhti-cli docker -u
dhti-cli conch install -g dermatologist/openmrs-esm-dhti -s packages/esm-chatbot-agent -n esm-chatbot-agent
# dhti-cli conch start -n esm-chatbot-agent -w /home/beapen/dhti -s packages/esm-chatbot-agent -s packages/esm-generic-display
# dhti-cli conch start -n esm-chatbot-agent -s packages/esm-chatbot-agent
dhti-cli conch start -n esm-chatbot-agent -l ../openmrs-esm-dhti/packages/esm-dhti-upload