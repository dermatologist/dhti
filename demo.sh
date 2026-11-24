#!/bin/bash
WORKDIR="${HOME}/dhti"

npx dhti-cli compose add -m langserve -w "$WORKDIR"
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-schat -s packages/simple_chat -w "$WORKDIR"
npx dhti-cli docker "$WORKDIR" -n yourdockerhandle/genai-test:1.0 -t elixir
npx dhti-cli docker -u -w "$WORKDIR"
npx dhti-cli conch install -g dermatologist/openmrs-esm-dhti -s packages/esm-chatbot-agent -n esm-chatbot-agent -w "$WORKDIR"
npx dhti-cli conch start -n esm-chatbot-agent -w "$WORKDIR" -s packages/esm-chatbot-agent