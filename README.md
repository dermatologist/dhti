
<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/dhti-logo.jpg" />
</p>

## About
- 🚀 *Dhanvantari rose out of the water with his four hands, holding a pot full of elixirs!*

TL; DR: **dhti-cli is for quick prototyping, developing, sharing and testing of Gen AI applications, models, and UI elements within the context of an electronic health record.**
[Paper coming soon!](https://nuchange.ca)

Gen AI can transform medicine. But it needs a framework for collaborative research and practice. DHTI is a reference architecture and an implementation for such a framework that integrates an EMR ([OpenMRS](https://openmrs.org/)), :link: Gen AI application server ([LangServe](https://python.langchain.com/v0.2/docs/langserve/)), self-hosted LLMs for privacy ([Ollama](https://ollama.com/)), tools on [MCP server](https://github.com/dermatologist/fhir-mcp-server),  vector store for RAG ([redis](https://redis.io/)), monitoring ([LangFuse](https://langfuse.com/)), 🔥 FHIR repository with [CQL](https://nuchange.ca/2025/06/v-llm-in-the-loop-cql-execution-with-unstructured-data-and-fhir-terminology-support.html) support ([HAPI](https://cloud.alphora.com/sandbox/r4/cqm/)) and graph utilities ([Neo4j](https://neo4j.com/)) in one docker-compose! DHTI is inspired by [Bahmni](https://www.bahmni.org/) and **aims to facilitate GenAI adoption and research in areas with low resources.** The MCP server hosts pluggable, agent-invokable tools (FHIR query, summarization, terminology lookup, custom analytics, etc.) that you can extend without modifying core services.

The essence of DHTI is *modularity* with an emphasis on *configuration!* It is non-opinionated on LLMs, hyperparameters and pretty much everything. DHTI supports installable Gen AI routines through [LangChain templates](https://templates.langchain.com/) (which we call :curry: **elixir**) and installable UI elements through [OpenMRS O3](https://o3-docs.openmrs.org/) React container (which we call :shell: **conch**). 🔥 FHIR is used for backend and [CDS-Hooks](https://cds-hooks.org/) for frontend communication, decoupling conches from OpenMRS, making them potentially usable with any health information system. We have a [fork of the cds-hook sandbox](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1) for testing that uses the [order-select](https://cds-hooks.org/hooks/order-select/) hook, utilizing the contentString from the [FHIR CommunicationRequest](https://build.fhir.org/communicationrequest.html) within the [cds-hook context](https://cds-hooks.org/examples/) for user inputs (recommended).

<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/cds-hook-sandbox.jpg" />
</p>

🚀 dhti-cli is a CLI tool for quick prototyping and testing of elixirs and conches. You can create a new docker-compose with required modules, start/stop services, install Elixirs and conch, create Docker images for them, and more. 🚀 This helps to test new ideas and share them with others quickly. 🚀 Once tested, you can transition them to production team for deployment. Adoption of standards makes this transition easier!

⭐️ **Pitched at [Falling Walls Lab Illinois](https://falling-walls.com/falling-walls-lab-illinois) and released on 09/12/2025.**

## Architecture
<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/arch-1.drawio.svg" />
</p>

## ✨ Features
* **Modular**: Supports installable Gen AI routines and UI elements.
* **Quick prototyping**: CLI helps in quick prototyping and testing of Gen AI routines and UI elements.
* **Easy to use**: Can be installed in a few minutes.
* **Developer friendly**: Copy working files to running containers for testing.
* **Dependency Injection**: Dependency injection for models and hyperparameters for configuring elixirs.
* **Generate synthetic data**: DHTI supports generating synthetic data for testing.
* **CQL support**: [CQL for clinical decision support](https://nuchange.ca/2025/06/v-llm-in-the-loop-cql-execution-with-unstructured-data-and-fhir-terminology-support.html).
* **FHIR**: Data exchange with FHIR schema.
* **MCP**: Built in MCP server for pluggable tools.
* **EMR**: Built in EMR, OpenMRS, for patient records.
* **Vector store**: Redis for vector store.
* **Monitoring**: LangFuse for monitoring.
* **Graph utilities**: Neo4j for graph utilities.
* **LLM**: Ollama for self-hosting LLM models.

## 🔧 For Gen AI Developers

*Developers can build elixirs and conchs for DHTI.*

:curry: Elixirs are [LangChain templates]((https://templates.langchain.com/)) for backend GenAI functionality. By convention, Elixirs are prefixed with *dhti-elixir-* and all elixirs depend on [dhti-elixir-base](https://github.com/dermatologist/dhti-elixir-base) which provides some base classes and defines dependencies. You can use [this template](https://github.com/dermatologist/dhti-elixir-template) to build new elixirs, and license it the way you want (We :heart: open-source!).

:shell: Conches are [OpenMRS O3s](https://o3-docs.openmrs.org/) and follow the standard naming convention *openmrs-esm-*. A separate OpenMRS independant container for conchs is on our roadmap for use outside OpenMRS. You can use [this template](https://github.com/dermatologist/openmrs-esm-dhti-template) to build new conches.

:white_check_mark:
* **Developer friendly**: Copy working files to running containers for testing.
* **Dependency Injection**: Dependency injection for models and hyperparameters for configuring elixirs.

## 🧠 For Gen AI Researchers

*DHTI provides a platform to deploy language models and Gen AI applications in the context of an electronic health record.*

DHTI serves as a platform for testing prompts, chains and agents in healthcare applications.  Since the stack uses the :fire: FHIR data model, it is easy to load synthetic data.

Tools to fine-tune language models for the stack are on our roadmap. We encourage all language models built for this platform to be open sourced on [HuggingFace](https://huggingface.co/) with the names starting with *dhti-*.

:white_check_mark:
* **Generate synthetic data**: DHTI supports generating synthetic data for testing.
* **CQL support**: [CQL for clinical decision support](https://nuchange.ca/2025/06/v-llm-in-the-loop-cql-execution-with-unstructured-data-and-fhir-terminology-support.html).
* **FHIR**: Data exchange with FHIR schema.
* **EMR**: Built in EMR, OpenMRS, for patient records.

 🌈 *Join us to make the Gen AI equitable and help doctors save lives!*

## :sparkles: Resources
* [fhiry](https://github.com/dermatologist/fhiry): FHIR to pandas dataframe for data analytics, AI and ML!
* [pyOMOP](https://github.com/dermatologist/pyomop): For OMOP CDM support

## :sparkles: Resources (in Beta)
* [dhti-elixir-base](https://github.com/dermatologist/dhti-elixir-base): Base classes for dhti-elixir
* [dhti-elixir-template](https://github.com/dermatologist/dhti-elixir-template): A template for creating new dhti-elixirs.
* [fhir-mcp-server](https://github.com/dermatologist/fhir-mcp-server): A MCP server for hosting FHIR-compliant tools.

## :sparkles: Resources (in Alpha)
* [cookiecutter for scaffolding elixirs](https://github.com/dermatologist/cookiecutter-uv)
* [cds-hooks-sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1)

## :sunglasses: Coming soon

* [dhti-elixir-fhire](https://github.com/dermatologist/dhti-elixir-fhire): An elixir for extracting embeddings from FHIR resources for Q&A on patient records.
* [dhti-elixir-fhirs](https://github.com/dermatologist/dhti-elixir-fhirs): An elixir for text to FHIR search query conversion.
* [dhti-elixir-upload](https://github.com/dermatologist/dhti-elixir-upload-file): Upload documents to the vector store for clinical knowledgebase and clinical trial matching.
* [openmrs-esm-qa](https://github.com/dermatologist/openmrs-esm-genai): A sample conch for Q&A on patient records using the dhti-elixir-fhire elixir.

## 🔧 Usage

### List of plugins
```
dhti-cli help
```

### Get help for each plugin
* As an example, get help for compose:

```
dhti-cli compose --help
```

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

### The demo uses a template with mock LLM. [Check out how to add real LLM support using Google Gemini.](/notes/add-llm.md)

:hugs: **Thank you for trying out DHTI!**

## 🚀 Advanced

* [Setting up Ollama](/notes/setup-ollama.md)
* [CLI Options](/notes/cli-options.md)

## Give us a star ⭐️
If you find this project useful, give us a star. It helps others discover the project.

## Contributors

* [Bell Eapen](https://nuchange.ca) | [![Twitter Follow](https://img.shields.io/twitter/follow/beapen?style=social)](https://twitter.com/beapen)


