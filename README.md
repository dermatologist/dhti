
<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/dhti-logo.jpg" />
</p>

[![npm version](https://badge.fury.io/js/dhti-cli.svg)](https://www.npmjs.com/package/dhti-cli)
[![npm](https://img.shields.io/npm/dt/dhti-cli)](https://www.npmjs.com/package/dhti-cli)
[![Build](https://github.com/dermatologist/dhti/workflows/CI/badge.svg)](https://nuchange.ca)
[![Known Vulnerabilities](https://snyk.io/test/github/dermatologist/dhti/badge.svg)](https://www.npmjs.com/package/dhti-cli)
[![Documentation](https://badgen.net/badge/icon/documentation?icon=libraries&label)](https://dermatologist.github.io/dhti/)
[![Wiki](https://img.shields.io/badge/DHTI-wiki-demo)](https://github.com/dermatologist/dhti/wiki)


- 🚀 *Dhanvantari rose out of the water with his four hands, holding a pot full of elixirs!*

#### TL; DR: 🏥 DHTI enables rapid prototyping, sharing, and testing of GenAI applications within an Electronic Health Record (EHR), facilitating the seamless transition of your experiments to clinical practice.
👉 [Try it out today!](#try-it-out) and give us a star ⭐️ if you like it!

### About

Generative AI features are built as [LangServe Apps](https://python.langchain.com/docs/langserve/) (elixirs) that can be installed into a LangServe instance and exposed as APIs. [OpenMRS O3 esm](https://o3-docs.openmrs.org/) / [**CDS hook** clients](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1) (conchs) provide the interface to communicate with these APIs. All backend data exchange is done through the **FHIR API** (a base class provides all these features). dhti-cli simplifies this process by providing a CLI that includes managing a Docker Compose with all additional components, such as [Ollama](https://ollama.com/) for **local LLM hosting**. LLM and hyperparameters are **injected at runtime** and can be easily swapped. In essence, dhti decouples GenAI modules from the rest of the system. 👉 [Try it out today!](#try-it-out)

### Want to know more?

Gen AI can transform medicine. But it needs a framework for collaborative research and practice. DHTI is a reference architecture and an implementation for such a framework that integrates an EMR ([OpenMRS](https://openmrs.org/)), :link: Gen AI application server ([LangServe](https://python.langchain.com/v0.2/docs/langserve/)), self-hosted LLMs for privacy ([Ollama](https://ollama.com/)), tools on [MCP server](https://github.com/dermatologist/fhir-mcp-server),  vector store for RAG ([redis](https://redis.io/)), monitoring ([LangFuse](https://langfuse.com/)), 🔥 FHIR repository with [CQL](https://nuchange.ca/2025/06/v-llm-in-the-loop-cql-execution-with-unstructured-data-and-fhir-terminology-support.html) support ([HAPI](https://cloud.alphora.com/sandbox/r4/cqm/)) and graph utilities ([Neo4j](https://neo4j.com/)) in one docker-compose! DHTI is inspired by [Bahmni](https://www.bahmni.org/) and **aims to facilitate GenAI adoption and research in areas with low resources.** The MCP server hosts pluggable, agent-invokable tools (FHIR query, summarization, terminology lookup, custom analytics, etc.) that you can extend without modifying core services.

The essence of DHTI is *modularity* with an emphasis on *configuration!* It is non-opinionated on LLMs, hyperparameters and pretty much everything. DHTI supports installable Gen AI routines through [LangServe Apps](https://python.langchain.com/docs/langserve/) (which we call :curry: **elixir**) and installable UI elements through [OpenMRS O3](https://o3-docs.openmrs.org/) React container (which we call :shell: **conch**). 🔥 FHIR is used for backend and [CDS-Hooks](https://cds-hooks.org/) for frontend communication, decoupling conches from OpenMRS, making them potentially usable with any health information system. We have a [fork of the cds-hook sandbox](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1) for testing that uses the [order-select](https://cds-hooks.org/hooks/order-select/) hook, utilizing the contentString from the [FHIR CommunicationRequest](https://build.fhir.org/communicationrequest.html) within the [cds-hook context](https://cds-hooks.org/examples/) for user inputs (recommended).

<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/cds-hook-sandbox.jpg" />
</p>

🚀 dhti-cli is a CLI tool for quick prototyping and testing of elixirs and conches. You can create a new docker-compose with required modules, start/stop services, install Elixirs and conch, create Docker images for them, and more. 🚀 This helps to test new ideas and share them with others quickly. 🚀 Once tested, you can transition them to the production team for deployment. Adoption of standards makes this transition easier! 👉 [Try it out today!](#try-it-out)

⭐️ **Pitched at [Falling Walls Lab Illinois](https://falling-walls.com/falling-walls-lab-illinois) and released on 09/12/2025.**

## What problems do DHTI solve?

| Why | How |
| --- | --- |
| I know LangChain, but I don’t know how to build a chain/agent based on data in our EHR. | [This template](https://github.com/dermatologist/dhti-elixir-template) adopts FHIR and cds-hooks as standards for data retrieval and display. The [base class](https://github.com/dermatologist/dhti-elixir-base) provides reusable artifacts |
| I need a simple platform for experimenting. | This repository provides  everything to start experimenting fast. The command-line tools help to virtualize and orchestrate your experiments using [Docker](https://www.docker.com/)|
| I am a UI designer. I want to design helpful UI for real users. | See [this template](https://github.com/dermatologist/openmrs-esm-dhti-template). It shows how to build interface components (conches) for [OpenMRS](https://openmrs.org/) an open-source EMR used by many. Read more about [OpenMRS UI](https://o3-docs.openmrs.org/) |
| We use another EMR  |  Your EMR may support CDS-Hook for displaying components. In that case, you can use [cds-hooks-sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1) |
| Our IT team is often unable to take my experiments to production. | Use DHTI, follow the recommended patterns, and you will make their lives easier.|


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

:curry: Elixirs are [LangServe Apps](https://python.langchain.com/docs/langserve/)  for backend GenAI functionality. By convention, Elixirs are prefixed with *dhti-elixir-* and all elixirs depend on [dhti-elixir-base](https://github.com/dermatologist/dhti-elixir-base) which provides some base classes and defines dependencies. You can use [this template](https://github.com/dermatologist/dhti-elixir-template) or the [cookiecutter](https://github.com/dermatologist/cookiecutter-uv) to build new elixirs, and license it the way you want (We :heart: open-source!).

:shell: Conches are [OpenMRS O3s](https://o3-docs.openmrs.org/) and follow the standard naming convention *openmrs-esm-*. You can use [this template](https://github.com/dermatologist/openmrs-esm-dhti-template) to build new conches.

:white_check_mark:
* **Developer friendly**: Copy working files to running containers for testing.
* **Dependency Injection**: Dependency injection for models and hyperparameters for configuring elixirs.
* 👉 [Try it out today!](#try-it-out)

## 🧠 For Gen AI Researchers

*DHTI provides a platform to deploy language models and Gen AI applications in the context of an electronic health record.*

DHTI serves as a platform for testing prompts, chains and agents in healthcare applications.  Since the stack uses the :fire: FHIR data model, it is easy to load synthetic data.

Tools to fine-tune language models for the stack are on our roadmap. We encourage all language models built for this platform to be open sourced on [HuggingFace](https://huggingface.co/) with the names starting with *dhti-*.

:white_check_mark:
* **Generate synthetic data**: DHTI supports generating synthetic data for testing.
* **CQL support**: [CQL for clinical decision support](https://nuchange.ca/2025/06/v-llm-in-the-loop-cql-execution-with-unstructured-data-and-fhir-terminology-support.html).
* **FHIR**: Data exchange with FHIR schema and **CDS-Hooks** for frontend-backend communication.
* **EMR**: Built-in EMR, OpenMRS, for patient records.
* 👉 [Try it out today!](#try-it-out)

 🌈 *Join us to make the Gen AI equitable and help doctors save lives!*

## :sparkles: Resources
* [fhiry](https://github.com/dermatologist/fhiry): FHIR to pandas dataframe for data analytics, AI and ML!
* [pyOMOP](https://github.com/dermatologist/pyomop): For OMOP CDM support

## :sparkles: Resources (in Beta)
* [dhti-elixir-base](https://github.com/dermatologist/dhti-elixir-base): Base classes for dhti-elixir
* [dhti-elixir-template](https://github.com/dermatologist/dhti-elixir-template): A template for creating new dhti-elixirs.
* [openmrs-esm-dhti-template](https://github.com/dermatologist/openmrs-esm-dhti-template): A conch template for OpenMRS
* [fhir-mcp-server](https://github.com/dermatologist/fhir-mcp-server): A MCP server for hosting FHIR-compliant tools.

## :sparkles: Resources (in Alpha)
* [cookiecutter for scaffolding elixirs](https://github.com/dermatologist/cookiecutter-uv)
* [cds-hooks-sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1)

## :sunglasses: Coming soon

* [dhti-elixir-fhire](https://github.com/dermatologist/dhti-elixir-fhire): An elixir for extracting embeddings from FHIR resources for Q&A on patient records.
* [dhti-elixir-fhirs](https://github.com/dermatologist/dhti-elixir-fhirs): An elixir for text to FHIR search query conversion.
* [dhti-elixir-upload](https://github.com/dermatologist/dhti-elixir-upload-file): Upload documents to the vector store for clinical knowledgebase and clinical trial matching.
* [openmrs-esm-qa](https://github.com/dermatologist/openmrs-esm-genai): A sample conch for Q&A on patient records using the dhti-elixir-fhire elixir.

## Try it out

* You only need [Node.js](https://nodejs.org/) and [Docker](https://www.docker.com/) installed to run this project. Optionally, you can install [Python](https://www.python.org/) if you want to develop new elixirs. We use a fake LLM script for testing purposes, so you don't need an OpenAI key to run this project. It just says "Paris" or "I don't know" to any prompt. You can replace it with any internal or external LLM service later.

* `npx dhti-cli help` to see all available commands.

* `npx dhti-cli compose add -m openmrs -m langserve` to add OpenMRS and Langserve elixirs to your docker-compose.yml at ~/dhti. Other available modules: `ollama, langfuse, cqlFhir, redis, neo4j and mcpFhir`. You can read the newly created docker-compose by: `npx dhti-cli compose read`

* `npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template` to install a sample elixir from github. (Optionally) You may configure the hyperparameters in `~/dhti/elixir/app/bootstrap.py`. You can install multiple elixirs.

* `npx dhti-cli docker -n yourdockerhandle/genai-test:1.0 -t elixir` to build a docker image for the elixir.

* `npx dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-dhti-template.git -n openmrs-esm-dhti-template` to install a simple OpenMRS ESM module (conch)from github. You can install multiple conches.

* `npx dhti-cli docker -n yourdockerhandle/conch-test:1.0 -t conch` to build a docker image for the conches.

* `npx dhti-cli docker -u` to start all the docker images in your docker-compose.yml.

### :clap: Access the Conch in OpenMRS and test the integration

* Go to `http://localhost/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123

You will see the new conch in the left margin. Click on **Dhti app** to see the UI.
This is just a template, though. You can build your own conchs!

Add some text to the text area and click on **Submit**.
You will see the text above the textbox.

* `npx dhti-cli docker -d` to stop and delete all the docker containers.

Read more in [notes/steps.md](/notes/steps.md). Complete documentation is in progress.

### The demo uses a template with mock LLM. [Check out how to add real LLM support using Google Gemini.](/notes/add-llm.md)

:hugs: **Thank you for trying out DHTI!**

## 🚀 Advanced

* [Detailed steps to try it out](/notes/steps.md)
* [Setting up Ollama](/notes/setup-ollama.md)
* [CLI Options](/notes/cli-options.md)

## Give us a star ⭐️
If you find this project useful, give us a star. It helps others discover the project.

## [Details of CLI Commands](/notes/README.md)

## Contributors

* [Bell Eapen](https://nuchange.ca) | [![Twitter Follow](https://img.shields.io/twitter/follow/beapen?style=social)](https://twitter.com/beapen)
