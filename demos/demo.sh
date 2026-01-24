dhti-cli compose reset
dhti-cli compose add -m langserve -m redis
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -b debug -n dhti-elixir-schat -s packages/simple_chat
dhti-cli docker -n dhti/genai-test:1.0 -t elixir
dhti-cli docker -u