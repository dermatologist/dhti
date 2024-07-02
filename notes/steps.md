
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
`./bin/dev.js elixir install -g https://github.com/dermatologist/dhti-elixir-fhire.git -b feature/schema-dict-1 -n dhti_elixir_fhire -w dhti/elixir`

## Examine bootstrap.py/

## Create docker container
`./bin/dev.js docker dhti/elixir -f dhti/docker-compose.yml -n beapen/genai-text:1.0 -t elixir`

## Remove the services
11. Remove the services: `docker compose -f dhti/docker-compose.yml down`