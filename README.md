# Dhanvantari (**dhti**)

<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/main/notes/dhti-logo.jpg" />
</p>

## Description
*Dhanvantari rose out of the water with his four hands, holding a pot full of elixirs!*

Gen AI can transform medicine but needs a framework for collaborative research and practice. Dhanvantari is a reference architecture for such a framework that integrates an EMR (OpenMRS), Gen AI application server (LangServe), self-hosted LLMs (Ollama), vector store (redis), monitoring (LangFuse), FHIR data repository (HAPI) and a graph database (Neo4j) in one docker-compose. Dhanvantari is inspired by Bhamini and aims to facilitate GenAI adoption and research in areas with low resources.

Dhanvantari supports installable Gen AI routines through LangServe templates called **elixirs** and installable UI elements through OpenMRS O3 React container (called **conch shell**). It uses Medprompt for base classes and Fhiry for FHIR processing.

Developers, Build elixirs & conch shells for Dhanvantari!
Researchers, Use Dhanvantari for testing your prompts, chains and agents!

Join us to make the Gen AI world equitable and help doctors save lives!



## dhti-cli


### Steps:

* Git clone this repository: `git clone https://github.com/dermatologist/dhti.git && cd dhti`
* Install the required packages: `npm install`

### Create a work directory (Optional) It can be in any location
* Create a work directory: `mkdir dhti`

### Create a new docker-compose
* Create a new docker-compose file: `./bin/dev.js compose add -m ollama -m redis -m openmrs -m langserve -f dhti/docker-compose.yml`
The docker-compose.yml is created with the following services:
    - Ollama (LLM model server)
    - Redis (Vectorstore)
    - OpenMRS (EMR)
    - LangServe (API for LLM models)

### Start the services
* Start the services: `docker compose -f dhti/docker-compose.yml up`
*It may take a while to download the images and start the services. (OpenMRS may take about 30 mins the first time to setup the database)*

### Download an LLM/Embedding models to use.
* Go to `localhost:8080`
* Create an account and login
* Click on settings, and download the following models
    - phi3:mini
    - all-minilm

### Access OpenMRS and login:
* Go to `localhost/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123

### Access the LangServe API
* Go to `localhost:8001/docs` (Empty Swagger UI)

## Now let us Install an Elixir (LangServe Template)

Let's install the elixir here: https://github.com/dermatologist/dhti-elixir-fhire
This elixir creates an embedding from patient's medical record for Q&A
`./bin/dev.js elixir install -g https://github.com/dermatologist/dhti-elixir-fhire.git -b feature/schema-dict-1 -n dhti_elixir_fhire -w dhti/dhti_elixir_fhire`

### Examine bootstrap.py/

### Create docker container
`./bin/dev.js docker dhti/dhti_elixir_fhire -f dhti/docker-compose.yml -n beapen/genai-test:1.0 -t elixir`

### Start the container with the new elixir
`docker compose -f dhti/docker-compose.yml up`

## Now let us Install a Conch (OpenMRS O3 Template)
Let's install the conch here:https://github.com/dermatologist/openmrs-esm-genai
This conch is a minimal Q&A interface for OpenMRS using the elixir above
`./bin/dev.js conch install -g https://github.com/dermatologist/openmrs-esm-genai.git -b refactor-2 -n openmrs-esm-genai -w dhti/openmrs-esm-genai`

## Create new docker container
`./bin/dev.js docker dhti/openmrs-esm-genai -f dhti/docker-compose.yml -n beapen/conch-test:1.0 -t conch`

### Start the container with the new conch
`docker compose -f dhti/docker-compose.yml up`

### Access the Conch in OpenMRS and test the integration

## Remove the services
* Remove the services: `docker compose -f dhti/docker-compose.yml down`

## Give us a star ⭐️
If you find this project useful, give us a star. It helps others discover the project.

## Contributors

* [Bell Eapen](https://nuchange.ca) | [![Twitter Follow](https://img.shields.io/twitter/follow/beapen?style=social)](https://twitter.com/beapen)