
<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/dhti-logo.jpg" alt="DHTI logo" />
</p>

[![npm version](https://badge.fury.io/js/dhti-cli.svg)](https://www.npmjs.com/package/dhti-cli)
[![npm downloads](https://img.shields.io/npm/dt/dhti-cli)](https://www.npmjs.com/package/dhti-cli)
[![Build](https://github.com/dermatologist/dhti/workflows/CI/badge.svg)](https://nuchange.ca)
[![Known Vulnerabilities](https://snyk.io/test/github/dermatologist/dhti/badge.svg)](https://www.npmjs.com/package/dhti-cli)
[![Documentation](https://badgen.net/badge/icon/documentation?icon=libraries&label)](https://dermatologist.github.io/dhti/)
[![Wiki](https://img.shields.io/badge/DHTI-wiki-demo)](https://github.com/dermatologist/dhti/wiki)

<!-- Dhanvantari reference -->
> 🚀 Dhanvantari rose out of the water with his four hands, holding a pot full of elixirs.

# DHTI
*DHTI enables rapid prototyping, sharing, and testing of GenAI healthcare applications inside an EHR, helping experiments move smoothly into practice. DHTI also includes [skills](/.github/skills/) that generate GenAI components from problem‑oriented [prompts](/prompts/e2e-sample.md).*

### Why?

Imagine you need to instantly determine whether a patient qualifies for a clinical trial. Your GenAI app pulls in the trial’s eligibility criteria, matches it against the patient’s EHR data, taps a vector store for RAG, relies on a self‑hosted LLM to keep everything private, and uses smart tools to fetch and analyze clinical details. The final output appears right inside the EHR—clean, clear, and clinician‑friendly. 💥 **And that’s just one example of the countless real‑world workflows DHTI makes possible.**

#### How? (Technical):
Generative AI features are built as [LangServe Apps](https://python.langchain.com/docs/langserve/) (elixirs). All backend data exchange is done through the **FHIR API** (a [base class](https://github.com/dermatologist/dhti-elixir-base) provides all these features) and displayed using CDS-Hooks. dhti-cli simplifies this process by providing a CLI that includes managing a Docker Compose with all additional components, such as [Ollama](https://ollama.com/) for **local LLM hosting**. LLM and hyperparameters are **injected at runtime** and can be easily swapped. In essence, dhti decouples GenAI modules from the rest of the system.

🚀 You can test the elixir using a real EMR system, [OpenMRS](https://openmrs.org/), that communicates with the elixir using **CDS-Hooks** or use any other CDS-Hooks compatible EMR system. You can also use the [CDS-Hooks sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1) without an EMR.

#### How (non‑technical / clinical)
DHTI includes ready‑to‑use [skills](/.github/skills/) that can prompt agentic platforms (e.g., [AntiGravity](https://antigravity.google/), VSCode, or Claude) to generate the GenAI backends and UI components (elixirs and conches) you need. Test these components with synthetic data in OpenMRS or the CDS‑Hooks sandbox, then hand them off to production teams. Because DHTI follows open standards, that handoff (the “valley of death”) becomes smoother and more predictable. Try the [prompts](/.github/skills/start-dhti/examples/e2e-sample.md) in your preferred agentic platform after cloning this repo.

## Try it out
[[Cheatsheet](/notes/cheatsheet.md) | [Download PDF Cheatsheet](https://nuchange.ca/wp-content/uploads/2026/01/dhti_cheatsheet.pdf)]

- Requirements: [Node.js](https://nodejs.org/) and [Docker](https://www.docker.com/). Optionally install [Python](https://www.python.org/) to develop or rapidly prototype elixirs.
- The sample elixir will use Google, OpenAI, or OpenRouter models if API keys are set in your environment; otherwise it falls back to a mock LLM. You can also use [Ollama](https://ollama.com/) for local model hosting. See [setup instructions](/notes/setup-ollama.md).

Quick start (try the demo script):
```bash
git clone https://github.com/dermatologist/dhti.git
cd dhti
./demo.sh    # Linux / macOS (Windows: use WSL)
```

Basic demo workflow:
```bash
npx dhti-cli help                         # list commands
npx dhti-cli compose add -m langserve     # add LangServe to ~/dhti/docker-compose.yml
npx dhti-cli compose read                 # view generated compose
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-schat -s packages/simple_chat
npx dhti-cli docker -n yourdockerhandle/genai-test:1.0 -t elixir
npx dhti-cli docker -u                    # start services from compose
```

Notes:
- Configure models and hyperparameters in `~/dhti/elixir/app/bootstrap.py` or install from a local directory using `-l`.
- Stop and remove containers with `npx dhti-cli docker -d`.

✌️  Decide where to test the new elixir: OpenMRS a full EHR system, or CDS-Hooks sandbox for a lightweight testing without an EHR.

💥  Test elixir in a  CDS-Hooks sandbox.

* `npx dhti-cli conch start -n dhti-elixir-schat` and navigate to the Application URL displayed in the console. (Uses hapi.fhir.org).
* In the **Rx View** tab, type in the contentString textbox and wait for the elixir to respond.

<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/cds-hook-sandbox.jpg" />
</p>

* We recommend using the [order-select](https://cds-hooks.org/hooks/order-select/) hook, utilizing the contentString from the [FHIR CommunicationRequest](https://build.fhir.org/communicationrequest.html) within the [cds-hook context](https://cds-hooks.org/examples/) for user inputs but you can use patient-view if no user input is needed.

💥  Test elixir in OpenMRS.

* `npx dhti-cli conch install -g dermatologist/openmrs-esm-dhti -s packages/esm-chatbot-agent -n esm-chatbot-agent` to install a sample chatbot conch from github.
    - *(Optional)* Alternatively, use `-l <local-directory>` to install from a local directory.

* `npx dhti-cli conch start -n esm-chatbot-agent -s packages/esm-chatbot-agent` to start the conch with OpenMRS.

* Go to `http://localhost:8080/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123

You will see the new **patient context aware chatbot** in the patient summary page. This is just an example. You can build your own! Check the implementation in the [elixir repo](https://github.com/dermatologist/dhti-elixir) and [conch repo](https://github.com/dermatologist/openmrs-esm-dhti).

<p align="center">
  <img src="https://github.com/dermatologist/openmrs-esm-dhti-template/blob/develop/notes/conch.jpg" />
</p>

* `npx dhti-cli docker -d` to stop and delete all the docker containers.

## Wiki & Documentation
* [![Wiki](https://img.shields.io/badge/DHTI-wiki-demo)](https://github.com/dermatologist/dhti/wiki)
* [Documentation](https://dermatologist.github.io/dhti/)
* [CLI Reference](/notes/README.md)

## User contributions & examples
* [Elixirs](https://github.com/dermatologist/dhti-elixir)
* [OpenMRS Conches / UI](https://github.com/dermatologist/openmrs-esm-dhti)
* [CDS Hooks Sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox)

## Presentations
⭐️ **Pitched at [Falling Walls Lab Illinois](https://falling-walls.com/falling-walls-lab-illinois) and released on 2025-09-12.**

## What problems do DHTI solve?

| Why | How |
| --- | --- |
| I know LangChain, but I don’t know how to build a chain/agent based on data in our EHR. | [These sample elixirs](https://github.com/dermatologist/dhti-elixir) adopt FHIR and cds-hooks as standards for data retrieval and display. The [base class](https://github.com/dermatologist/dhti-elixir-base) provides reusable artifacts |
| I need a simple platform for experimenting. | This repository provides  everything to start experimenting fast. The command-line tools help to virtualize and orchestrate your experiments using [Docker](https://www.docker.com/)|
| I am a UI designer. I want to design helpful UI for real users. | See [these sample conches](https://github.com/dermatologist/openmrs-esm-dhti). It shows how to build interface components (conches) for [OpenMRS](https://openmrs.org/) an open-source EMR used by many. Read more about [OpenMRS UI](https://o3-docs.openmrs.org/) |
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
* **DOCKTOR module**: A new module, [DOCKTOR](/notes/DOCKTOR.md), supports traditional machine‑learning models packaged as Docker containers. These can be used as MCP tools to deploy inference pipelines as agent‑invokable tools (in beta).
* **MCP aware agent**: [dhti-elixir-template](https://github.com/dermatologist/dhti-elixir-template) used in the examples now includes an [MCP aware agent](https://github.com/dermatologist/dhti-elixir-template/blob/feature/agent-2/src/dhti_elixir_template/chain.py) that can autodiscover and invoke tools from the MCPX gateway. Install it using `npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template -b feature/agent2`.
* **Medplum integration**: [Medplum](https://www.medplum.com/) is now supported as an alternative FHIR server. Read more [here](/notes/medplum.md). This allows you to add FHIR subscriptions for real-time updates and much more.
* **Synthea integration**: You can now generate synthetic FHIR data using [Synthea](https://synthetichealth.github.io/synthea/). Read more [here](/notes/SYNTHEA.md).
* **MIMIC support**: You can now load [MIMIC Demo](https://physionet.org/content/mimic-iv-demo/2.2/) data using DHTI in [one command](https://nuchange.ca/2024/11/loading-mimic-dataset-onto-a-fhir-server-in-two-easy-steps.html).


## 🔧 For Gen AI Developers

*Developers can build elixirs and conches for DHTI.* See CONTRIBUTING.md for details. User contributed [elixir](https://github.com/dermatologist/dhti-elixir) and [conch](https://github.com/dermatologist/openmrs-esm-dhti) repositories provide examples and templates for development.

## 🧠 For Gen AI Researchers

*DHTI provides a platform to deploy AI models and Gen AI applications in the context of an electronic health record.*

DHTI serves as a platform for testing models, prompts, chains, and agents in healthcare applications. Because the stack uses the :fire: FHIR data model, it is easy to load synthetic data. We encourage models built for this platform to be open‑sourced on [HuggingFace](https://huggingface.co/) using the `dhti-` prefix.

## 🚀 For clinicians

*DHTI includes [skills](/.github/skills/) that generate GenAI components from problem‑oriented [prompts](/prompts/e2e-sample.md).*

## ✨ Resources
* [fhiry](https://github.com/dermatologist/fhiry): FHIR to pandas dataframe for data analytics, AI and ML!
* [pyOMOP](https://github.com/dermatologist/pyomop): For OMOP CDM support
* [cookiecutter for scaffolding elixirs](https://github.com/dermatologist/cookiecutter-uv)
* [cds-hooks-sandbox for testing](https://github.com/dermatologist/cds-hooks-sandbox/tree/dhti-1)
* [Medplum integration](/notes/medplum.md)

## Give us a star ⭐️
If you find this project useful, give us a star. It helps others discover the project.

## Contributors

* [Bell Eapen](https://nuchange.ca) ([UIS](https://www.uis.edu/directory/bell-punneliparambil-eapen)) |  [Contact](https://nuchange.ca/contact) | [![Twitter Follow](https://img.shields.io/twitter/follow/beapen?style=social)](https://twitter.com/beapen)
