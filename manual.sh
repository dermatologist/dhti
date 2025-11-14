# rm -rf ~/dhti
# npm run build
# npm link
# dhti-cli compose add -m openmrs -m langserve
# dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template
# dhti-cli docker -n beapen/genai-test:1.0 -t elixir
# dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-dhti-template.git -n openmrs-esm-dhti-template
# dhti-cli docker -n beapen/conch-test:1.0 -t conch
dhti-cli docker -u
## Waiit for all containers to be up and running before accessing OpenMRS
sleep 45
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost/openmrs/spa/home || true)
TRIES=0
while [ "$HTTP_STATUS" -ne 200 ] && [ $TRIES -lt 10 ]; do
  # track tries
  TRIES=$((TRIES + 1))
  echo "Waiting for OpenMRS to be available..."
  sleep 10
  HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost/openmrs/spa/home || true)
done
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "OpenMRS is available!"
else
    echo "Failed to access OpenMRS. HTTP Status: $HTTP_STATUS"
fi
## Wait a bit more for conch to be fully initialized
sleep 7
dhti-cli docker -d

