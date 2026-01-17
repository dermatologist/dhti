#!/bin/bash
npx dhti-clicompose add -m langserve
npx dhti-clielixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-schat -s packages/simple_chat
npx dhti-clidocker -n yourdockerhandle/genai-test:1.0 -t elixir
npx dhti-clidocker -u
npx dhti-cliconch install -g dermatologist/openmrs-esm-dhti -s packages/esm-chatbot-agent -n esm-chatbot-agent
npx dhti-cliconch start -n esm-chatbot-agent -w /home/beapen/dhti -s packages/esm-chatbot-agent