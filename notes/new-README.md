
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

# Digital Health Transformation Initiative (DHTI)


#### TL; DR: 🏥 DHTI enables rapid prototyping, sharing, and testing of GenAI healthcare applications within an EHR, facilitating the seamless transition of your experiments to practice! Moreover, DHTI comes with batteries included! It has the [skills](/.github/skills/) to generate GenAI components from simple problem oriented [prompts](/prompts/e2e-sample.md).

### Why DHTI?

Consider a scenario where you want to check a patient is eligible for a clinical trial. You want to build a GenAI application that can check the eligibility criteria against the patient's medical records in your EHR system. You may want to use a vector store for RAG, a self-hosted LLM for privacy, and some tools for data retrieval and analytics. You may also want to display the results in a user-friendly way within the EHR interface. **This is just one of many possible clinical scenarios where DHTI can help.**

#### How? (Technical):
Generative AI features are built as [LangServe Apps](https://python.langchain.com/docs/langserve/) (elixirs). All backend data exchange is done through the **FHIR API** (a base class provides all these features) and displayed using CDS-Hooks. dhti-cli simplifies this process by providing a CLI that includes managing a Docker Compose with all additional components, such as [Ollama](https://ollama.com/) for **local LLM hosting**. LLM and hyperparameters are **injected at runtime** and can be easily swapped. In essence, dhti decouples GenAI modules from the rest of the system.

You can test the elixir using a real EMR system, [OpenMRS](https://openmrs.org/), with a sample conch (OpenMRS O3 esm) that communicates with the elixir using **CDS-Hooks** or use any other CDS-Hooks compatible EMR system. You can also use the [cds-hooks-sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1) without an EMR.

🚀 dhti-cli is a CLI tool for quick prototyping and testing of elixirs and conches. You can create a new docker-compose with required modules, start/stop services, install Elixirs and conchs, create Docker images for them, and more. 🚀 This helps to test new ideas and share them with others quickly.

#### How? (Non-technical/Clinical):
DHTI comes with batteries (skills) included. You just describe your problem in simple terms using [prompts](/prompts/e2e-sample.md) using an agentic platform like [AntiGravity](https://antigravity.google/), vscode or Clause, and DHTI will generate the required GenAI and UI components (elixirs and conches) for you. You can then test them in a real EMR with synthetic data. Once tested, you can transition them to the production team for deployment. Adoption of standards makes this transition easier!

#### Examples
* [Elixirs](https://github.com/dermatologist/dhti-elixir)
* [OpenMRS Conches / UI](https://github.com/dermatologist/openmrs-esm-dhti)

## Try it out

* You only need [Node.js](https://nodejs.org/) and [Docker](https://www.docker.com/) installed to run this project. Optionally, you can install [Python](https://www.python.org/) if you want to develop new elixirs. We use a fake LLM script for testing purposes, so you don't need an OpenAI key to run this project. It just says "Paris" or "I don't know" to any prompt. You can replace it with any internal or external LLM service later.

👉  **If you are in a hurry, just run `./demo.sh` from a terminal (Linux or MacOS) in the root folder to try out the demo.** Windows users can use WSL. You only need [Node.js](https://nodejs.org/) and [Docker](https://www.docker.com/). This script runs all the commands below. Once done, use `npx dhti-cli docker -d` to stop and delete all the docker containers.

* `npx dhti-cli help` to see all available commands.

* `npx dhti-cli compose add -m langserve` to add Langserve to your docker-compose.yml at ~/dhti. Other available modules: `ollama, langfuse, cqlFhir, redis, neo4j and mcpFhir`. You can read the newly created docker-compose by: `npx dhti-cli compose read`

* `npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-schat -s packages/simple_chat` to install a sample chat elixir from github. *(Optional)* You may configure the LLM and hyperparameters in `~/dhti/elixir/app/bootstrap.py`. You can install multiple elixirs. Alternatively, use `-l <local-directory>` to install from a local directory.

* `npx dhti-cli docker -n yourdockerhandle/conch-test:1.0 -t conch` to build a docker image for the conches.

* `npx dhti-cli docker -u` to start all the docker images in your docker-compose.yml.

* *(Optional)* **🔍 Dry-run mode**: Add the `--dry-run` flag to any command to preview what changes will be made without actually executing them. For example:
  - `npx dhti-cli compose add -m langserve --dry-run` to preview modules that would be added
  - `npx dhti-cli elixir install -n test-elixir --dry-run` to see what files would be created/modified

### :clap: Start a Conch in OpenMRS and test the new elixir

* `npx dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-dhti -n openmrs-esm-chatbot-agent -s packages/esm-chatbot-agent` to install a sample conch from github. Alternatively, use `-l <local-directory>` to install from a local directory.

* Go to `http://localhost:8080/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123

You will see the new conch in the left margin. Click on **Dhti app** to see the UI.
This is just a template, though. You can build your own conchs!

Add some text to the text area and click on **Submit**.
You will see the text above the textbox.

* `npx dhti-cli docker -d` to stop and delete all the docker containers.

Read [![Wiki](https://img.shields.io/badge/DHTI-wiki-demo)](https://github.com/dermatologist/dhti/wiki) for more details.

## 👋 The demo uses mock LLM. 👉 [Check out how to add real LLMs and configure them.](https://github.com/dermatologist/dhti/wiki/Configuration)

:hugs: **Thank you for trying out DHTI!**

### 🎨 Visuals

<p align="center">
  <img src="https://github.com/dermatologist/openmrs-esm-dhti-template/blob/develop/notes/conch.jpg" />
</p>



<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/cds-hook-sandbox.jpg" />
</p>

*[CDS-Hooks sandbox](https://github.com/dermatologist/cds-hooks-sandbox) for testing conchs without OpenMRS.* 👉 [Try it out today!](#try-it-out)



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
* **Dry-run mode**: Preview changes before execution with the `--dry-run` flag.
* **Local directory installation**: Install elixirs and conches from local directories using the `-l` flag.
* **Monorepo support**: Install elixirs and conches from subdirectories in GitHub repositories with the `-s` flag.
* **Dependency Injection**: Dependency injection for models and hyperparameters for configuring elixirs.
* **Generate synthetic data**: [DHTI supports generating synthetic data for testing, using synthea.](/notes/SYNTHEA.md)
* **CQL support**: [CQL for clinical decision support](https://nuchange.ca/2025/06/v-llm-in-the-loop-cql-execution-with-unstructured-data-and-fhir-terminology-support.html).
* **FHIR**: Data exchange with FHIR schema.
* **MCP**: Built in MCP server for pluggable tools.
* **EMR**: Built in EMR, OpenMRS, for patient records.
* **Vector store**: Redis for vector store.
* **Monitoring**: LangFuse for monitoring.
* **Graph utilities**: Neo4j for graph utilities.
* **LLM**: Ollama for self-hosting LLM models.

## ✨ New
* **Local directory installation**: Install elixirs and conches from local directories using the new `-l` flag, enabling seamless integration with locally generated projects.
* **start-dhti skill**: New AI agent skill that orchestrates complete DHTI application development - from generating elixirs and conches to starting a fully functional DHTI server.
* **MCPX integration**: DHTI now includes an [MCP integrator](https://docs.lunar.dev/mcpx/) that allows other MCP servers to be "installed" and exposed seamlessly to DHTI through the MCPX gateway.
* **DOCKTOR module**: A new module, [DOCKTOR](/notes/DOCKTOR.md), support traditional machine learning model packaged as Docker containers, to be used as MCP tools, enabling the deployment of inference pipelines as agent-invokable tools. (in beta)
* **MCP aware agent**: [dhti-elixir-template](https://github.com/dermatologist/dhti-elixir-template) used in the examples now includes an [MCP aware agent](https://github.com/dermatologist/dhti-elixir-template/blob/feature/agent-2/src/dhti_elixir_template/chain.py) that can autodiscover and invoke tools from the MCPX gateway. Install it using `npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template -b feature/agent2`.
* **Medplum integration**: [Medplum](https://www.medplum.com/) is now supported as an alternative FHIR server. Read more [here](/notes/medplum.md). This allows you to add FHIR subscriptions for real-time updates and much more.
* **Synthea integration**: You can now generate synthetic FHIR data using [Synthea](https://synthetichealth.github.io/synthea/). Read more [here](/notes/SYNTHEA.md).
* **MIMIC support**: You can now load [MIMIC Demo](https://physionet.org/content/mimic-iv-demo/2.2/) data using DHTI in [one command](https://nuchange.ca/2024/11/loading-mimic-dataset-onto-a-fhir-server-in-two-easy-steps.html).


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

*Join us to make the Gen AI equitable and help doctors save lives!*

## :sparkles: Resources
* [fhiry](https://github.com/dermatologist/fhiry): FHIR to pandas dataframe for data analytics, AI and ML!
* [pyOMOP](https://github.com/dermatologist/pyomop): For OMOP CDM support

## :sparkles: Resources (in Beta)
* [dhti-elixir-base](https://github.com/dermatologist/dhti-elixir-base): Base classes for dhti-elixir
* [dhti-elixir-template](https://github.com/dermatologist/dhti-elixir-template): A template for creating new dhti-elixirs & a **simple EMR chatbot backend**.
* [openmrs-esm-dhti-template](https://github.com/dermatologist/openmrs-esm-dhti-template): A conch template for OpenMRS & a **simple EMR chatbot frontend**.
* [fhir-mcp-server](https://github.com/dermatologist/fhir-mcp-server): A MCP server for hosting FHIR-compliant tools.

## :sparkles: Resources (in Alpha)
* [cookiecutter for scaffolding elixirs](https://github.com/dermatologist/cookiecutter-uv)
* [cds-hooks-sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1)
* [Medplum integration](/notes/medplum.md)

## :sunglasses: Coming soon

* [dhti-elixir-fhire](https://github.com/dermatologist/dhti-elixir-fhire): An elixir for FHIR embeddings.
* [dhti-elixir-upload](https://github.com/dermatologist/dhti-elixir-upload-file): Upload documents to the vector store for clinical knowledgebase and clinical trial matching.



## 🚀 Advanced

* [Detailed steps to try it out](/notes/steps.md)
* [Setting up Ollama](/notes/setup-ollama.md)
* [CLI Options](/notes/cli-options.md)

## Give us a star ⭐️
If you find this project useful, give us a star. It helps others discover the project.

## [Details of CLI Commands](/notes/README.md)

## Contributors

* [Bell Eapen](https://nuchange.ca) ([UIS](https://www.uis.edu/directory/bell-punneliparambil-eapen)) |  [Contact](https://nuchange.ca/contact) | [![Twitter Follow](https://img.shields.io/twitter/follow/beapen?style=social)](https://twitter.com/beapen)
