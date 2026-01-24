#!/bin/bash
rm -rf ~/dhti
dhti-cli compose add -m langserve -m orthanc
dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -b debug -n dhti-elixir-imaging-report -s packages/imaging_report
dhti-cli docker -n yourdockerhandle/genai-test:4.0 -t elixir
dhti-cli docker -u
dhti-cli conch install -g dermatologist/openmrs-esm-dhti -b debug -n esm-dhti
dhti-cli conch start -n esm-dhti -l ../openmrs-esm-dhti/packages/esm-dhti-imaging-report
# dhti-cli conch install -g dermatologist/openmrs-esm-dhti -b debug -n esm-imaging-report
# dhti-cli conch start -n esm-imaging-report -s packages/esm-dhti-imaging-report
# npx degit {git}#{branch} {workdir}/esm-dhti/packages/{name}

dhti-cli conch start -n esm-dhti -l ../openmrs-esm-dhti/packages/esm-dhti-orthanc-viewer
