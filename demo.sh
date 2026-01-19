#!/bin/bash
npx dhti-cli compose add -m langserve
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-schat -s packages/simple_chat
npx dhti-cli docker -n yourdockerhandle/genai-test:1.0 -t elixir
npx dhti-cli docker -u
npx dhti-cli conch install -g dermatologist/openmrs-esm-dhti -s packages/esm-chatbot-agent -n esm-chatbot-agent
npx dhti-cli conch start -n esm-chatbot-agent -w /home/beapen/dhti -s packages/esm-chatbot-agent