#!/bin/bash
npx dhti-cli compose reset
npx dhti-cli compose add -m langserve -m redis
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -b debug -n dhti-elixir-schat -s packages/simple_chat
npx dhti-cli docker -n dhti/genai-test:1.0 -t elixir
npx dhti-cli docker -u

# Testing in CDS-Hooks sandbox
#! Remember to click on the application link rather than the final display link
npx dhti-cli elixir start -n dhti-elixir-schat

# Testing in OpenMRS EMR
npx dhti-cli conch install -s packages/esm-chatbot-agent
npx dhti-cli conch start -s packages/esm-chatbot-agent

