
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


##### TL; DR: 🏥 DHTI enables rapid prototyping, sharing, and testing of GenAI healthcare applications within an EHR, facilitating the seamless transition of your experiments to practice! Moreover, DHTI comes with batteries included! It has the [skills](/.github/skills/) to generate GenAI components from simple problem oriented [prompts](/prompts/e2e-sample.md).

### Why DHTI?

Imagine you need to instantly determine whether a patient qualifies for a clinical trial. Your GenAI app pulls in the trial’s eligibility criteria, matches it against the patient’s EHR data, taps a vector store for RAG, relies on a self‑hosted LLM to keep everything private, and uses smart tools to fetch and analyze clinical details. The final output appears right inside the EHR—clean, clear, and clinician‑friendly. 💥 **And that’s just one example of the countless real‑world workflows DHTI makes possible.**

#### How? (Technical):
Generative AI features are built as [LangServe Apps](https://python.langchain.com/docs/langserve/) (elixirs). All backend data exchange is done through the **FHIR API** (a base class provides all these features) and displayed using CDS-Hooks. dhti-cli simplifies this process by providing a CLI that includes managing a Docker Compose with all additional components, such as [Ollama](https://ollama.com/) for **local LLM hosting**. LLM and hyperparameters are **injected at runtime** and can be easily swapped. In essence, dhti decouples GenAI modules from the rest of the system.

🚀 You can test the elixir using a real EMR system, [OpenMRS](https://openmrs.org/), that communicates with the elixir using **CDS-Hooks** or use any other CDS-Hooks compatible EMR system. You can also use the [cds-hooks-sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1) without an EMR (ensure both are using same FHIR endpoint).

#### How? (Non-technical/Clinical):
DHTI comes with batteries ([skills](/.github/skills/)) included to [prompt](/prompts/e2e-sample.md) an agentic platform like [AntiGravity](https://antigravity.google/), vscode or Clause, to generate the required GenAI and UI components (elixirs and conches) for you! You can then test them in a real EMR (OpenMRS) with synthetic data. Once tested, you can transition them to the production team for deployment. Because everything is built on open standards, that handoff (often called the **valley of death**) becomes smooth and predictable.

#### Examples
* [Elixirs](https://github.com/dermatologist/dhti-elixir)
* [OpenMRS Conches / UI](https://github.com/dermatologist/openmrs-esm-dhti)

## Try it out

* You only need [Node.js](https://nodejs.org/) and [Docker](https://www.docker.com/) installed to run this project. Optionally, you can install [Python](https://www.python.org/) if you want to develop / vibe-code new elixirs. You can use any LLM supported by [LangChain](https://python.langchain.com/docs/get_started/installation/) in your elixirs. The sample elixir used below picks up google, openai or openrouter models if the respective API keys are set in environment variables. Otherwise it defaults to a mock LLM. You can also use [Ollama](https://ollama.com/) for local LLM hosting. Read more [here](/notes/setup-ollama.md).

👉  **If you are in a hurry, just clone this repo and run `./demo.sh` from a terminal (Linux or MacOS) in the root folder to try out the demo.** Windows users can use WSL. This script runs all the commands below. Skip to 💥 Start conch in OpenMRS, and once done, use `npx dhti-cli docker -d` to stop and delete all the docker containers.

* `npx dhti-cli help` to see all available commands.

* `npx dhti-cli compose add -m langserve` to add Langserve to your docker-compose.yml at ~/dhti.
    - *(Optional)* Other available modules: `ollama, langfuse, cqlFhir, redis, neo4j, mcpx and mcpFhir`.
    - *(Optional)* You can read the newly created docker-compose by: `npx dhti-cli compose read`

* `npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-schat -s packages/simple_chat` to install a sample chat elixir from github.
    - *(Optional)* You may configure the LLM and hyperparameters in `~/dhti/elixir/app/bootstrap.py`. You can install multiple elixirs.
    - *(Optional)* Alternatively, use `-l <local-directory>` to install from a local directory.

* `npx dhti-cli docker -n yourdockerhandle/genai-test:1.0 -t elixir` to build a docker image for the elixir.

* `npx dhti-cli docker -u` to start all the docker images in your docker-compose.yml.

💥  Start conch in OpenMRS and test the new elixir

* `npx dhti-cli conch install -g dermatologist/openmrs-esm-dhti -s packages/esm-chatbot-agent -n esm-chatbot-agent` to install a sample chatbot conch from github.
    - *(Optional)* Alternatively, use `-l <local-directory>` to install from a local directory.

* `dhti-cli conch start -n esm-chatbot-agent -s packages/esm-chatbot-agent` to start the conch with OpenMRS.

* Go to `http://localhost:8080/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123

You will see the new **patient context aware chatbot** in the patient summary page. This is just an example. You can build your own! Check the implementation in the [elixir repo](https://github.com/dermatologist/dhti-elixir).

<p align="center">
  <img src="https://github.com/dermatologist/openmrs-esm-dhti-template/blob/develop/notes/conch.jpg" />
</p>

* `npx dhti-cli docker -d` to stop and delete all the docker containers.

Read [![Wiki](https://img.shields.io/badge/DHTI-wiki-demo)](https://github.com/dermatologist/dhti/wiki) for more details.

#### [CDS-Hooks sandbox](https://github.com/dermatologist/cds-hooks-sandbox) for testing conchs without OpenMRS.
<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/cds-hook-sandbox.jpg" />
</p>

⭐️ **Pitched at [Falling Walls Lab Illinois](https://falling-walls.com/falling-walls-lab-illinois) and released on 09/12/2025.**

## What problems do DHTI solve?

| Why | How |
| --- | --- |
| I know LangChain, but I don’t know how to build a chain/agent based on data in our EHR. | [These samples](https://github.com/dermatologist/dhti-elixir) adopt FHIR and cds-hooks as standards for data retrieval and display. The [base class](https://github.com/dermatologist/dhti-elixir-base) provides reusable artifacts |
| I need a simple platform for experimenting. | This repository provides  everything to start experimenting fast. The command-line tools help to virtualize and orchestrate your experiments using [Docker](https://www.docker.com/)|
| I am a UI designer. I want to design helpful UI for real users. | See [these samples](https://github.com/dermatologist/openmrs-esm-dhti). It shows how to build interface components (conches) for [OpenMRS](https://openmrs.org/) an open-source EMR used by many. Read more about [OpenMRS UI](https://o3-docs.openmrs.org/) |
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

## ✨ Advanced Features
* **start-dhti skill**: New AI agent skill that orchestrates complete DHTI application development - from generating elixirs and conches to starting a fully functional DHTI server.
* **MCPX integration**: DHTI now includes an [MCP integrator](https://docs.lunar.dev/mcpx/) that allows other MCP servers to be "installed" and exposed seamlessly to DHTI through the MCPX gateway.
* **DOCKTOR module**: A new module, [DOCKTOR](/notes/DOCKTOR.md), support traditional machine learning model packaged as Docker containers, to be used as MCP tools, enabling the deployment of inference pipelines as agent-invokable tools. (in beta)
* **MCP aware agent**: [dhti-elixir-template](https://github.com/dermatologist/dhti-elixir-template) used in the examples now includes an [MCP aware agent](https://github.com/dermatologist/dhti-elixir-template/blob/feature/agent-2/src/dhti_elixir_template/chain.py) that can autodiscover and invoke tools from the MCPX gateway. Install it using `npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template -b feature/agent2`.
* **Medplum integration**: [Medplum](https://www.medplum.com/) is now supported as an alternative FHIR server. Read more [here](/notes/medplum.md). This allows you to add FHIR subscriptions for real-time updates and much more.
* **Synthea integration**: You can now generate synthetic FHIR data using [Synthea](https://synthetichealth.github.io/synthea/). Read more [here](/notes/SYNTHEA.md).
* **MIMIC support**: You can now load [MIMIC Demo](https://physionet.org/content/mimic-iv-demo/2.2/) data using DHTI in [one command](https://nuchange.ca/2024/11/loading-mimic-dataset-onto-a-fhir-server-in-two-easy-steps.html).


## 🔧 For Gen AI Developers

*Developers can build elixirs and conchs for DHTI.*

Elixirs are [LangServe Apps](https://python.langchain.com/docs/langserve/)  for backend GenAI functionality. By convention, Elixirs are prefixed with *dhti-elixir-* and all elixirs depend on [dhti-elixir-base](https://github.com/dermatologist/dhti-elixir-base) which provides some base classes and defines dependencies. You can use the [cookiecutter](https://github.com/dermatologist/cookiecutter-uv) to build new elixirs, and license it the way you want (We :heart: open-source!).

:shell: Conches are [OpenMRS O3s](https://o3-docs.openmrs.org/) and follow the standard naming convention *openmrs-esm-*. You can use [these examples](https://github.com/dermatologist/openmrs-esm-dhti) to build new conches.


## 🧠 For Gen AI Researchers

*DHTI provides a platform to deploy language models and Gen AI applications in the context of an electronic health record.*

DHTI serves as a platform for testing prompts, chains and agents in healthcare applications.  Since the stack uses the :fire: FHIR data model, it is easy to load synthetic data. Tools to fine-tune language models for the stack are on our roadmap. We encourage all language models built for this platform to be open sourced on [HuggingFace](https://huggingface.co/) with the names starting with *dhti-*.


*Join us to make the Gen AI equitable and help doctors save lives!*

## :sparkles: Resources
* [fhiry](https://github.com/dermatologist/fhiry): FHIR to pandas dataframe for data analytics, AI and ML!
* [pyOMOP](https://github.com/dermatologist/pyomop): For OMOP CDM support
* [cookiecutter for scaffolding elixirs](https://github.com/dermatologist/cookiecutter-uv)
* [cds-hooks-sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1)
* [Medplum integration](/notes/medplum.md)

## 🚀 Advanced

* [Detailed steps to try it out](/notes/steps.md)
* [Setting up Ollama](/notes/setup-ollama.md)
* [CLI Options](/notes/cli-options.md)

## Give us a star ⭐️
If you find this project useful, give us a star. It helps others discover the project.

## Contributors

* [Bell Eapen](https://nuchange.ca) ([UIS](https://www.uis.edu/directory/bell-punneliparambil-eapen)) |  [Contact](https://nuchange.ca/contact) | [![Twitter Follow](https://img.shields.io/twitter/follow/beapen?style=social)](https://twitter.com/beapen)
