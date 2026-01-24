#!/bin/bash
npx dhti-cli compose reset
npx dhti-cli compose add -m langserve -m orthanc
# elixir operation requires full git repo path
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-imaging-report -s packages/imaging_report
npx dhti-cli docker -n dhti/genai-test:4.0 -t elixir
npx dhti-cli docker -u

# Configure LLMs and hyperparameters as needed
npx dhti-cli docker bootstrap -f bootstrap.py
# Edit bootstrap.py to set preferred LLMs and hyperparameters, then run the above command again to apply changes


npx dhti-cli conch install # (Optional) if you have not performed this step before.
npx dhti-cli conch start -s packages/esm-dhti-imaging-report -s packages/esm-dhti-orthanc-viewer

# Finally remove docker containers if no longer needed
npx dhti-cli docker -d

#* Testing in CDS-Hooks sandbox is not yet supported for DICOM imaging report