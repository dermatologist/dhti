#!/bin/bash
npx dhti-cli compose reset
npx dhti-cli compose add -m langserve -m orthanc
# elixir operation requires full git repo path
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-imaging-report -s packages/imaging_report
npx dhti-cli docker -n dhti/genai-test:4.0 -t elixir
npx dhti-cli docker -u
npx dhti-cli conch install -g dermatologist/openmrs-esm-dhti -n esm-dhti
npx dhti-cli conch start -n esm-dhti -s /packages/esm-dhti-imaging-report -s packages/esm-dhti-orthanc-viewer

# Finally
# npx dhti-cli docker -d

# Testing in CDS-Hooks sandbox is not yet supported for DICOM imaging report