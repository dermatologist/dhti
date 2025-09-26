# STEPS

### 🏗️ *Try it out! It takes only a few minutes to setup GenAI backed EMR in your local machine!*

You only need:
* docker
* nodejs

## :walking: Step 1

* Git clone this repository: `git clone https://github.com/dermatologist/dhti.git && cd dhti`
* Install the required packages: `npm install`
* Build the CLI: `npm run build`
* Install CLI locally: `npm link`
* Test the CLI: `dhti-cli help`  *This will show the available commands.*
* The working directory is `~/dhti` (Customizable)

### 🔧 Create a new docker-compose
* Create a new docker-compose file: `dhti-cli compose add -m openmrs -m langserve`

* The docker-compose.yml is created with the following modules:
    - OpenMRS (EMR)
    - LangServe (API for LLM models)

Other available modules: `ollama, langfuse, cqlFhir, redis, neo4j and mcpFhir` (Documentation in progress)

You can read the newly created docker-compose by: `dhti-cli compose read`


### 🚀 Start the services for initial setup
* Start the services: `dhti-cli docker -u`

It may take a while to download the images and start the services. ([OpenMRS](https://openmrs.org/) may take upto 45 mins the first time to setup the database)


### 🚀 Access OpenMRS and login:
* Go to `http://localhost/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123
    - Choose any location and click on 'confirm'.

### 🚀 Access the LangServe API
* Go to `localhost:8001/docs` (Empty Swagger UI)

## Congratulations! You have successfully setup DHTI! :tada:
* Shut down the services: `dhti-cli docker -d`

## :running: STEP 2: 🛠️ *Now let us Install an Elixir (Gen AI functionalities are packaged as elixirs)*

* Let's install the elixir here: https://github.com/dermatologist/dhti-elixir-template. This is just a template that uses a Mock LLM to output random text. You can use this template to build your own elixirs! (Cookiecutter to be released soon!) Later you will see how to add real LLM support.

:running:

`dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template`.

You may also install from PyPi or a wheel file!

### 🔍 Examine bootstrap.py (Optional)
`cat ~/dhti/elixir/app/bootstrap.py`

This is where you can override defaults in the elixir for *LLM, embedding model, hyperparameters etc that are injected at runtime.* Refer to each elixir for the available options. [You may check out how to inject a real LLM using Google Gemini!](/notes/add-llm.md)

### 🔧 Create docker container
`dhti-cli docker -n beapen/genai-test:1.0 -t elixir`

(You may replace `beapen/genai-test:1.0` with your own image name)

### 🚀 Congratulations! You installed your first elixir. We will see it in action later!

While developing you can copy the app folder to a running container for testing (provided there are no changes in dependencies). Read more [here](/notes/dev-copy.md).

## STEP 3: :shell: *Now let us Install a Conch (The UI component)*

* Let's install the conch here:https://github.com/dermatologist/openmrs-esm-dhti-template. This uses the elixir template that we installed in STEP 2 as the backend. You can use the template to build your own conchs.

:shell: `dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-dhti-template.git -n openmrs-esm-dhti-template`

We can also install from a dev folder after cloning the repository. While developing you can copy the dist folder to a running container for testing. Read more [here](/notes/dev-copy.md).

### 🔧 Create new docker container
`dhti-cli docker -n beapen/conch-test:1.0 -t conch`

## 🚀 It is now time to start DHTI!

`dhti-cli docker -u`

### :clap: Access the Conch in OpenMRS and test the integration

* Go to `http://localhost/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123

You will see the new conch in the left margin. Click on **Dhti app** to see the UI.
This is just a template, though. You can build your own conchs!

Add some text to the text area and click on **Submit**.
You will see the text above the textbox.

### Stop the services
You can remove the services by: `dhti-cli docker -d`
