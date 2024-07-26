
<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/dhti-logo.jpg" />
</p>

## About
- 🚀 *Dhanvantari rose out of the water with his four hands, holding a pot full of elixirs!*

TL; DR: **dhti-cli is for quick prototyping, developing, sharing and testing of Gen AI applications, models, and UI elements within the context of an electronic health record.**
[Paper coming soon!](https://nuchange.ca)

Gen AI can transform medicine. But, it needs a framework for collaborative research and practice. Dhanvantari is a reference architecture and an implementation for such a framework that integrates an EMR ([OpenMRS](https://openmrs.org/)), :link: Gen AI application server ([LangServe](https://python.langchain.com/v0.2/docs/langserve/)), self-hosted LLMs for privacy ([Ollama](https://ollama.com/)), vector store for RAG ([redis](https://redis.io/)), monitoring ([LangFuse](https://langfuse.com/)), :fire: FHIR repository with CQL support ([HAPI + Alphora](https://cloud.alphora.com/sandbox/r4/cqm/)) and graph utilities ([Neo4j](https://neo4j.com/)) in one docker-compose! Dhanvantari is inspired by [Bahmni](https://www.bahmni.org/) and **aims to facilitate GenAI adoption and research in areas with low resources.**

The essence of Dhanvantari is *modularity* with an emphasis on *configuration!* It is non-opinionated on LLMs, hyperparameters and pretty much everything. Dhanvantari supports installable Gen AI routines through [LangChain templates](https://templates.langchain.com/) (which we call :curry: **elixir**) and installable UI elements through [OpenMRS O3](https://o3-docs.openmrs.org/) React container (which we call :shell: **conch**).

## ✨ Features
* **Modular**: Supports installable Gen AI routines and UI elements.
* **Quick prototyping**: CLI helps in quick prototyping and testing of Gen AI routines and UI elements.
* **Easy to use**: Can be installed in a few minutes.
* **Developer friendly**: Copy working files to running containers for testing.
* **Dependency Injection**: Dependency injection for models and hyperparameters for configuring elixirs.
* **Generate synthetic data**: Dhanvantari supports generating synthetic data for testing.
* **CQL support**: CQL for clinical decision support.
* **FHIR**: Data exchange with FHIR schema.
* **EMR**: Built in EMR, OpenMRS, for patient records.
* **Vector store**: Redis for vector store.
* **Monitoring**: LangFuse for monitoring.
* **Graph utilities**: Neo4j for graph utilities.
* **LLM**: Ollama for self-hosting LLM models.

## 🔧 For Gen AI Developers

*Developers can build elixirs and conchs for Dhanvantari.*

:curry: Elixirs are [LangChain templates]((https://templates.langchain.com/)) for backend GenAI functionality. By convention, Elixirs are prefixed with *dhti-elixir-* and all elixirs depend on [dhti-elixir-base](https://github.com/dermatologist/dhti-elixir-base) which provides some base classes and defines dependencies. You can use [this template](https://github.com/dermatologist/dhti-elixir-template) to build new elixirs, and license it the way you want (We :heart: open-source!).

:shell: Conches are [OpenMRS O3s](https://o3-docs.openmrs.org/) and follow the standard naming convention *openmrs-esm-*. A separate OpenMRS independant container for conchs is on our roadmap for use outside OpenMRS. You can use [this template](https://github.com/dermatologist/openmrs-esm-dhti-template) to build new conches.

:white_check_mark:
* **Developer friendly**: Copy working files to running containers for testing.
* **Dependency Injection**: Dependency injection for models and hyperparameters for configuring elixirs.

## 🧠 For Gen AI Researchers

*Dhanvantari provides a platform to deploy language models and Gen AI applications in the context of an electronic health record.*

DHTI serves as a platform for testing prompts, chains and agents in healthcare applications.  Since the stack uses the :fire: FHIR data model, it is easy to load synthetic data.

Tools to fine-tune language models for the stack are on our roadmap. We encourage all language models built for this platform to be open sourced on [HuggingFace](https://huggingface.co/) with the names starting with *dhti-*.

:white_check_mark:
* **Generate synthetic data**: Dhanvantari supports generating synthetic data for testing.
* **CQL support**: CQL for clinical decision support.
* **FHIR**: Data exchange with FHIR schema.
* **EMR**: Built in EMR, OpenMRS, for patient records.

 🌈 *Join us to make the Gen AI equitable and help doctors save lives!*

## :sunglasses: Coming soon

* [dhti-elixir-fhire](https://github.com/dermatologist/dhti-elixir-fhire): An elixir for extracting embeddings from FHIR resources for Q&A on patient records.
* [dhti-elixir-fhirs](https://github.com/dermatologist/dhti-elixir-fhirs): An elixir for text to FHIR search query conversion.
* [dhti-elixir-upload](https://github.com/dermatologist/dhti-elixir-upload-file): Upload documents to the vector store for clinical knowledgebase and clinical trial matching.
* [openmrs-esm-qa](https://github.com/dermatologist/openmrs-esm-genai): A sample conch for Q&A on patient records using the dhti-elixir-fhire elixir.

### 🏗️ *Try it out! It takes only a few minutes to setup GenAI backed EMR in your local machine!*

You only need:
* docker
* nodejs

## :walking: Step 1 (Detailed instructions [here](/notes/instructions.md))

* Git clone this repository: `git clone https://github.com/dermatologist/dhti.git && cd dhti`
* Install the required packages: `npm install`
* Build the CLI: `npm run build`
* Install CLI locally: `npm link`
* Test the CLI: `dhti-cli help`  *This will show the available commands.*
* The working directory is `~/dhti` (You can [change it](#dhti-cli) if you want)

### 🔧 Create a new docker-compose
* Create a new docker-compose file: `dhti-cli compose add -m ollama -m redis -m openmrs -m langserve`

* The docker-compose.yml is created with the following services:
    - Ollama (LLM model server)
    - Redis (Vectorstore)
    - OpenMRS (EMR)
    - LangServe (API for LLM models)

You can read the newly created docker-compose by: `dhti-cli compose read`

There are other services available. See [here](/notes/instructions.md) for more details.

### 🚀 Start the services for initial setup
* Start the services: `dhti-cli docker -u`

It may take a while to download the images and start the services. ([OpenMRS](https://openmrs.org/) may take upto 45 mins the first time to setup the database)

### 💾 Download an LLM/Embedding models to use.
* Go to `localhost:8080`
* Create an account and login in webui. (The account is created in your local machine.)
  - Click on your name on left bottom corner
  - Click on settings -> Admin Panel -> Models
* Download the following models
    - phi3:mini
    - all-minilm

### 🚀 Access OpenMRS and login:
* Go to `http://localhost/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123
    - Choose any location and click on 'confirm'.

### 🚀 Access the LangServe API
* Go to `localhost:8001/docs` (Empty Swagger UI)

## Congratulations! You have successfully setup Dhanvantari! :tada:
* Shut down the services: `dhti-cli docker -d`

## :running: STEP 2: 🛠️ *Now let us Install an Elixir (Gen AI functionalities are packaged as elixirs)*

* Let's install the elixir here: https://github.com/dermatologist/dhti-elixir-template. This is just an elixir template that summarizes text based on a simple prompt. You can use this template to build your own elixirs!

:running: `dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template`. You may also install from a wheel file. Read more [here](#dhti-cli).

### 🔍 Examine bootstrap.py (Optional)
`cat ~/dhti/elixir/app/bootstrap.py`

This is where you can override defaults in the elixir for *LLM, embedding model, hyperparameters etc that are injected at runtime.* Refer to each elixir for the available options.

### 🔧 Create docker container
`dhti-cli docker -n beapen/genai-test:1.0 -t elixir` (You can use any name for the container)

### 🚀 Congratulations! You installed your first elixir. We will see it in action later!

While developing you can copy the app folder to a running container for testing (provided there are no changes in dependencies). Read more [here](/notes/instructions.md).

## STEP 3: :shell: *Now let us Install a Conch (The UI component)*

* Let's install the conch here:https://github.com/dermatologist/openmrs-esm-dhti-template. This uses the elixir template that we installed in STEP 2 as the backend. You can use the template to build your own conchs.

:shell: `dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-dhti-template.git -n openmrs-esm-dhti-template`

We can also install from a dev folder after cloning the repository. While developing you can copy the dist folder to a running container for testing. Read more [here](/notes/instructions.md).

### 🔧 Create new docker container
`dhti-cli docker -n beapen/conch-test:1.0 -t conch`

## 🚀 It is now time to start Dhanvantari! :tada:

`dhti-cli docker -u`

### :clap: Access the Conch in OpenMRS and test the integration

* Go to `http://localhost/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123

You will see the new conch in the left margin. Click on **Dhti app** to see the UI.
This is just a template, though. You can build your own conchs!

Add some text to the text area and click on **Submit**.
You will see the summarized text above the textbox in about 30 seconds. (The LLM is running in your local machine!)
You can remove the services by: `dhti-cli docker -d`

:hugs: **Thank you for trying out Dhanvantari!**

## Give us a star ⭐️
If you find this project useful, give us a star. It helps others discover the project.

## Contributors

* [Bell Eapen](https://nuchange.ca) | [![Twitter Follow](https://img.shields.io/twitter/follow/beapen?style=social)](https://twitter.com/beapen)


# Auto generated README

dhti-cli
=================

Dhanvantari CLI


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/dhti-cli.svg)](https://npmjs.org/package/dhti-cli)
[![Downloads/week](https://img.shields.io/npm/dw/dhti-cli.svg)](https://npmjs.org/package/dhti-cli)


<!-- toc -->
* [Auto generated README](#auto-generated-readme)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g dhti-cli
$ dhti-cli COMMAND
running command...
$ dhti-cli (--version)
dhti-cli/0.1.0 linux-x64 node-v20.15.0
$ dhti-cli --help [COMMAND]
USAGE
  $ dhti-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dhti-cli compose [OP]`](#dhti-cli-compose-op)
* [`dhti-cli conch [OP]`](#dhti-cli-conch-op)
* [`dhti-cli docker [PATH]`](#dhti-cli-docker-path)
* [`dhti-cli elixir [OP]`](#dhti-cli-elixir-op)
* [`dhti-cli help [COMMAND]`](#dhti-cli-help-command)
* [`dhti-cli plugins`](#dhti-cli-plugins)
* [`dhti-cli plugins add PLUGIN`](#dhti-cli-plugins-add-plugin)
* [`dhti-cli plugins:inspect PLUGIN...`](#dhti-cli-pluginsinspect-plugin)
* [`dhti-cli plugins install PLUGIN`](#dhti-cli-plugins-install-plugin)
* [`dhti-cli plugins link PATH`](#dhti-cli-plugins-link-path)
* [`dhti-cli plugins remove [PLUGIN]`](#dhti-cli-plugins-remove-plugin)
* [`dhti-cli plugins reset`](#dhti-cli-plugins-reset)
* [`dhti-cli plugins uninstall [PLUGIN]`](#dhti-cli-plugins-uninstall-plugin)
* [`dhti-cli plugins unlink [PLUGIN]`](#dhti-cli-plugins-unlink-plugin)
* [`dhti-cli plugins update`](#dhti-cli-plugins-update)
* [`dhti-cli synthetic [INPUT] [OUTPUT] [PROMPT]`](#dhti-cli-synthetic-input-output-prompt)

## `dhti-cli compose [OP]`

Generates a docker-compose.yml file from a list of modules

```
USAGE
  $ dhti-cli compose [OP] [-f <value>] [-m <value>...]

ARGUMENTS
  OP  Operation to perform (add, delete or read)

FLAGS
  -f, --file=<value>       [default: /home/M267492/dhti/docker-compose.yml] Full path to the docker compose file to read
                           from. Creates if it does not exist
  -m, --module=<value>...  Modules to add from ( langserve, openmrs, ollama, langfuse, cqlFhir, redis and neo4j)

DESCRIPTION
  Generates a docker-compose.yml file from a list of modules

EXAMPLES
  $ dhti-cli compose
```

_See code: [src/commands/compose.ts](https://github.com/dermatologist/dhti/blob/v0.1.0/src/commands/compose.ts)_

## `dhti-cli conch [OP]`

Install or uninstall conchs to create a Docker image

```
USAGE
  $ dhti-cli conch [OP] [-b <value>] [-c <value>] [-d <value>] [-g <value>] [-i <value>] [-n <value>] [-v
    <value>] [-w <value>]

ARGUMENTS
  OP  Operation to perform (install, uninstall or dev)

FLAGS
  -b, --branch=<value>       [default: develop] Branch to install from
  -c, --container=<value>    [default: dhti-frontend-1] Name of the container to copy the conch to while in dev mode
  -d, --dev=<value>          [default: none] Dev folder to install
  -g, --git=<value>          [default: none] Github repository to install
  -i, --image=<value>        [default: openmrs/openmrs-reference-application-3-frontend:3.0.0-beta.17] Base image to use
                             for the conch
  -n, --name=<value>         Name of the elixir
  -v, --repoVersion=<value>  [default: 1.0.0] Version of the conch
  -w, --workdir=<value>      [default: /home/M267492/dhti] Working directory to install the conch

DESCRIPTION
  Install or uninstall conchs to create a Docker image

EXAMPLES
  $ dhti-cli conch
```

_See code: [src/commands/conch.ts](https://github.com/dermatologist/dhti/blob/v0.1.0/src/commands/conch.ts)_

## `dhti-cli docker [PATH]`

Build a docker project and update docker-compose file

```
USAGE
  $ dhti-cli docker [PATH] [-d] [-f <value>] [-n <value>] [-t <value>] [-u]

ARGUMENTS
  PATH  [default: /home/M267492/dhti] Docker project path to build. Ex: dhti

FLAGS
  -d, --down          Run docker-compose down after building
  -f, --file=<value>  [default: /home/M267492/dhti/docker-compose.yml] Full path to the docker compose file to edit or
                      run.
  -n, --name=<value>  Name of the container to build
  -t, --type=<value>  [default: elixir] Type of the service (elixir/conch)
  -u, --up            Run docker-compose up after building

DESCRIPTION
  Build a docker project and update docker-compose file

EXAMPLES
  $ dhti-cli docker
```

_See code: [src/commands/docker.ts](https://github.com/dermatologist/dhti/blob/v0.1.0/src/commands/docker.ts)_

## `dhti-cli elixir [OP]`

Install or uninstall elixirs to create a Docker image

```
USAGE
  $ dhti-cli elixir [OP] [-b <value>] [-c <value>] [-d <value>] [-g <value>] [-n <value>] [-v <value>] [-t
    <value>] [-e <value>] [-w <value>]

ARGUMENTS
  OP  Operation to perform (install, uninstall or dev)

FLAGS
  -b, --branch=<value>       [default: develop] Branch to install from
  -c, --container=<value>    [default: dhti-langserve-1] Name of the container to copy the conch to while in dev mode
  -d, --dev=<value>          [default: none] Dev folder to install
  -e, --whl=<value>          [default: none] Whl file to install
  -g, --git=<value>          [default: none] Github repository to install
  -n, --name=<value>         Name of the elixir
  -t, --type=<value>         [default: chain] Type of elixir (chain, tool or agent)
  -v, --repoVersion=<value>  [default: 0.1.0] Version of the elixir
  -w, --workdir=<value>      [default: /home/M267492/dhti] Working directory to install the elixir

DESCRIPTION
  Install or uninstall elixirs to create a Docker image

EXAMPLES
  $ dhti-cli elixir
```

_See code: [src/commands/elixir.ts](https://github.com/dermatologist/dhti/blob/v0.1.0/src/commands/elixir.ts)_

## `dhti-cli help [COMMAND]`

Display help for dhti-cli.

```
USAGE
  $ dhti-cli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for dhti-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.3/src/commands/help.ts)_

## `dhti-cli plugins`

List installed plugins.

```
USAGE
  $ dhti-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ dhti-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/index.ts)_

## `dhti-cli plugins add PLUGIN`

Installs a plugin into dhti-cli.

```
USAGE
  $ dhti-cli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into dhti-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the DHTI_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the DHTI_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ dhti-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ dhti-cli plugins add myplugin

  Install a plugin from a github url.

    $ dhti-cli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ dhti-cli plugins add someuser/someplugin
```

## `dhti-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ dhti-cli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ dhti-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/inspect.ts)_

## `dhti-cli plugins install PLUGIN`

Installs a plugin into dhti-cli.

```
USAGE
  $ dhti-cli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into dhti-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the DHTI_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the DHTI_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ dhti-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ dhti-cli plugins install myplugin

  Install a plugin from a github url.

    $ dhti-cli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ dhti-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/install.ts)_

## `dhti-cli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ dhti-cli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ dhti-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/link.ts)_

## `dhti-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ dhti-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dhti-cli plugins unlink
  $ dhti-cli plugins remove

EXAMPLES
  $ dhti-cli plugins remove myplugin
```

## `dhti-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ dhti-cli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/reset.ts)_

## `dhti-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ dhti-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dhti-cli plugins unlink
  $ dhti-cli plugins remove

EXAMPLES
  $ dhti-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/uninstall.ts)_

## `dhti-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ dhti-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dhti-cli plugins unlink
  $ dhti-cli plugins remove

EXAMPLES
  $ dhti-cli plugins unlink myplugin
```

## `dhti-cli plugins update`

Update installed plugins.

```
USAGE
  $ dhti-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.3.2/src/commands/plugins/update.ts)_

## `dhti-cli synthetic [INPUT] [OUTPUT] [PROMPT]`

Generate synthetic data using LLM

```
USAGE
  $ dhti-cli synthetic [INPUT] [OUTPUT] [PROMPT] [-i input|instruction|output] [-m <value>] [-r <value>] [-o
    input|instruction|output]

ARGUMENTS
  INPUT   Input file to process
  OUTPUT  Output file to write
  PROMPT  Prompt file to read

FLAGS
  -i, --inputField=<option>   [default: input] Input field to use
                              <options: input|instruction|output>
  -m, --maxCycles=<value>     Maximum number of cycles to run
  -o, --outputField=<option>  [default: output] Output field to use
                              <options: input|instruction|output>
  -r, --maxRecords=<value>    [default: 10] Maximum number of records to generate

DESCRIPTION
  Generate synthetic data using LLM

EXAMPLES
  $ dhti-cli synthetic
```

_See code: [src/commands/synthetic.ts](https://github.com/dermatologist/dhti/blob/v0.1.0/src/commands/synthetic.ts)_
<!-- commandsstop -->
