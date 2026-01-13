#!/bin/bash
rm -rf ~/dhti
# dhti-cli compose add -m langserve -m docktor
dhti-cli compose add -m langserve
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -b debug -n dhti-elixir-schat -s packages/simple_chat
dhti-cli docker -n yourdockerhandle/genai-test:1.0 -t elixir
dhti-cli docker -u
# dhti-cli docktor install my-pipeline --image mcp/sequentialthinking:latest --model-path /home/beapen/gitcola/temp
dhti-cli conch install -g dermatologist/openmrs-esm-dhti -b debug -s packages/esm-chatbot-agent -n esm-chatbot-agent
dhti-cli conch start -n esm-chatbot-agent -w /home/beapen/dhti -s packages/esm-chatbot-agent