#!/bin/bash
rm -rf ~/dhti
npx -y dhti-cli compose add -m openmrs -m langserve
npx -y dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template
npx -y dhti-cli docker -n yourdockerhandle/genai-test:1.0 -t elixir
npx -y dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-dhti-template.git -n openmrs-esm-dhti-template
npx -y dhti-cli docker -n yourdockerhandle/conch-test:1.0 -t conch
npx -y dhti-cli docker -u
## Wait for all containers to be up and running before accessing OpenMRS
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
    echo "Access it at: http://localhost/openmrs/spa/home and login with admin/Admin123"
else
    echo "Failed to access OpenMRS. HTTP Status: $HTTP_STATUS"
fi


