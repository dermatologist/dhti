rm -rf ~/dhti
npm run build
npm link
dhti-cli compose add -m openmrs -m langserve
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template
dhti-cli docker -n beapen/genai-test:1.0 -t elixir --dry-run
dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-dhti-template.git -n openmrs-esm-dhti-template
dhti-cli docker -n beapen/conch-test:1.0 -t conch --dry-run
dhti-cli docker -u --dry-run
dhti-cli docker -d --dry-run