## Steps:

* Git clone this repository: `git clone https://github.com/dermatologist/dhti.git && cd dhti`
* Install the required packages: `npm install`
* Build the CLI: `npm run build`
* Install CLI locally: `npm link`
* Test the CLI: `dhti-cli help`

### Create a work directory (**Optional**). Default is *~/dhti*
* Create a work directory: `mkdir dhti`

### Create a new docker-compose
* Create a new docker-compose file: `dhti-cli compose add -m ollama -m redis -m openmrs -m langserve`

* The docker-compose.yml is created with the following services:
    - Ollama (LLM model server)
    - Redis (Vectorstore)
    - OpenMRS (EMR)
    - LangServe (API for LLM models)

You can read the file by: `dhti-cli compose read`

### Start the services
* Start the services: `dhti-cli docker -u`

It may take a while to download the images and start the services. (OpenMRS may take about 30 mins the first time to setup the database)

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

### *Now let us Install an Elixir (LangServe Template)*

* Let's install the elixir here: https://github.com/dermatologist/dhti-elixir-fhire

* This elixir creates an embedding from patient's medical record for Q&A

`dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-fhire.git -n dhti-elixir-fhire`

You may also install from a wheel file (after building it locally):

`dhti-cli elixir install -e ../dhti-elixir-fhire/dist/dhti_elixir_fhire-0.0.1-py3-none-any.whl -n dhti-elixir-fhire -v 0.0.1`

### Examine bootstrap.py
`cat ~/dhti/elixir/app/bootstrap.py`

You need to refer to the elixir documentation for the parameters required for the bootstrap.py. This is where you define the *LLM, embedding model, hyperparameters etc that are injected at runtime.*

### Create docker container
`dhti-cli docker -n beapen/genai-test:1.0 -t elixir`

### Start the container with the new elixir (Optional, you can do it after the next two steps)
`dhti-cli docker -u`

### *Now let us Install a Conch (OpenMRS O3 Template)*

* Let's install the conch here:https://github.com/dermatologist/openmrs-esm-genai
* This conch is a minimal Q&A interface for OpenMRS using the elixir above for Q&A on patient records.

`dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-genai.git -b refactor-2 -n openmrs-esm-genai`

We can also install from a dev folder

`dhti-cli conch install -e ~/repos/openmrs-esm-genai -n openmrs-esm-genai -v 0.0.1`

### Create new docker container
`dhti-cli docker -n beapen/conch-test:1.0 -t conch`

### Start the container with the new conch
`dhti-cli docker -u`

### Copy dev folder to a running container
`dhti-cli conch dev -e ~/repos/openmrs-esm-genai -n openmrs-esm-genai -c dhti-frontend-1`

### Access the Conch in OpenMRS and test the integration

### Remove the services
* Remove the services: `dhti-cli docker -d`
