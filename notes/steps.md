
# Getting Started

## Steps:

1. Git clone this repository: `git clone https://github.com/dermatologist/dhti.git && cd dhti`
2. Install the required packages: `npm install`

## Create a work directory (Optional) It can be in any location
3. Create a work directory: `mkdir dhti`

## Create a new docker-compose
3. Create a new docker-compose file: `./bin/dev.js compose add -m ollama -m redis -m openmrs -m langserve -f dhti/docker-compose.yml`
The docker-compose.yml is created with the following services:
    - Ollama (LLM model server)
    - Redis (Vectorstore)
    - OpenMRS (EMR)
    - LangServe (API for LLM models)

## Start the services
4. Start the services: `docker compose -f dhti/docker-compose.yml up`
It may take a while to download the images and start the services. (OpenMRS may take about 30 mins the first time to setup the database)

## Download an LLM/Embedding models to use.
5. Go to `localhost:8080`
6. Create an account and login
7. Click on settings, and download the following models
    - phi3:mini
    - all-minilm

## Access OpenMRS and login:
8. Go to `localhost/openmrs/spa/home`
9. Login with the following credentials:
    - Username: admin
    - Password: Admin123

## Access the LangServe API
10. Go to `localhost:8001/docs` (Empty Swagger UI)

# Now let us Install an Elixir (LangServe Template)

Let's install the elixir here: https://github.com/dermatologist/dhti-elixir-fhire
This elixir creates an embedding from patient's medical record for Q&A
`./bin/dev.js elixir install -g https://github.com/dermatologist/dhti-elixir-fhire.git -b feature/schema-dict-1 -n dhti_elixir_fhire -w dhti`
You may also install from a wheel file: `./bin/dev.js elixir install -e ~/repos/dhti-elixir-fhire/dist/dhti_elixir_fhire-0.0.1-py3-none-any.whl -n dhti_elixir_fhire -v 0.0.1 -w dhti`

## Examine bootstrap.py

## Create docker container
`./bin/dev.js docker dhti -f dhti/docker-compose.yml -n beapen/genai-test:1.0 -t elixir`

## Start the container with the new elixir (Optional, you can do it after the next two steps)
`docker compose -f dhti/docker-compose.yml up`

# Now let us Install a Conch (OpenMRS O3 Template)
Let's install the conch here:https://github.com/dermatologist/openmrs-esm-genai
This conch is a minimal Q&A interface for OpenMRS using the elixir above
`./bin/dev.js conch install -g https://github.com/dermatologist/openmrs-esm-genai.git -b refactor-2 -n openmrs-esm-genai -w dhti`
We can also install from a dev folder
`./bin/dev.js conch install -e ~/repos/openmrs-esm-genai -n openmrs-esm-genai -v 0.0.1 -w dhti`

## Create new docker container
`./bin/dev.js docker dhti -f dhti/docker-compose.yml -n beapen/conch-test:1.0 -t conch`

## Start the container with the new conch
`docker compose -f dhti/docker-compose.yml up`

## Copy dev folder to a running container
`./bin/dev.js conch dev -e ~/repos/openmrs-esm-genai -n openmrs-esm-genai -w dhti -c dhti-frontend-1`

## Access the Conch in OpenMRS and test the integration

## Remove the services
11. Remove the services: `docker compose -f dhti/docker-compose.yml down`


