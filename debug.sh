#!/bin/bash
rm -rf ~/dhti
dhti-cli compose add -m openmrs -m langserve -m docktor
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -b debug -n dhti-elixir-template
dhti-cli docker -n yourdockerhandle/genai-test:1.0 -t elixir
dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-dhti-template.git -n openmrs-esm-dhti-template
dhti-cli docker -n yourdockerhandle/conch-test:1.0 -t conch
dhti-cli docker -u
dhti-cli docktor install my-pipeline --image mcp/sequentialthinking:latest --model-path /home/beapen/gitcola/temp
