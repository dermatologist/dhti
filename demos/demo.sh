#!/bin/bash
dhti-cli compose reset
dhti-cli compose add -m langserve -m docktor
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-achat -s packages/agent_chat
dhti-cli docker -n dhti/genai-test:2.0 -t elixir
dhti-cli docker -u
dhti-cli docktor install my-pipeline --image mcp/sequentialthinking:latest --model-path /tmp