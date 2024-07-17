# Dhanvantari (**dhti**)

<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/develop/notes/dhti-logo.jpg" />
</p>

## About
*---- Dhanvantari rose out of the water with his four hands, holding a pot full of elixirs! ----*

TL; DR: *dhti-cli is for quick prototyping, developing, sharing and testing of Gen AI applications, models, and UI elements within the context of an electronic health record.*

Gen AI can transform medicine but needs a framework for collaborative research and practice. Dhanvantari is a reference architecture for such a framework that integrates an EMR ([OpenMRS](https://openmrs.org/)), :link: Gen AI application server ([LangServe](https://python.langchain.com/v0.2/docs/langserve/)), self-hosted LLMs for privacy ([Ollama](https://ollama.com/)), vector store for RAG ([redis](https://redis.io/)), monitoring ([LangFuse](https://langfuse.com/)), :fire: FHIR repository with CQL support ([HAPI + Alphora](https://cloud.alphora.com/sandbox/r4/cqm/)) and graph utilities ([Neo4j](https://neo4j.com/)) in one docker-compose! Dhanvantari is inspired by [Bahmni](https://www.bahmni.org/) and **aims to facilitate GenAI adoption and research in areas with low resources.**

The essence of Dhanvantari is *modularity* with an emphasis on *configuration!* It is non-opinionated on LLMs, hyperparameters and pretty much everything. Dhanvantari supports installable Gen AI routines through [LangChain templates](https://templates.langchain.com/) (which we call :curry: **elixir**) and installable UI elements through [OpenMRS O3](https://o3-docs.openmrs.org/) React container (which we call :shell: **conch**).

Dhanvantari is a reference architecture for Gen AI in healthcare. [Paper coming soon!](https://nuchange.ca)

## Developers

*Developers can build elixirs and conchs for Dhanvantari.*

:curry: Elixirs are [LangChain templates]((https://templates.langchain.com/)) for backend GenAI functionality. By convention, Elixirs are prefixed with *dhti-elixir-* and all elixirs depend on [dhti-elixir-base](https://github.com/dermatologist/dhti-elixir-base) which provides some base classes and defines dependencies. You can use [this template](https://github.com/dermatologist/dhti-elixir-template) to build new elixirs.

:shell: Conches are [OpenMRS O3s](https://o3-docs.openmrs.org/) and follow the standard naming convention *openmrs-esm-*. A separate OpenMRS independant container for conchs is on our roadmap for use outside OpenMRS.  **This repository provides a command-line-interface (CLI) to make development easy.**

## Researchers

*Dhanvantari provides a platform to deploy language models and Gen AI applications in the context of an electronic health record.*

This serves as a platform for testing prompts, chains and agents in healthcare applications.  Since the stack uses the :fire: FHIR data model, it is easy to load synthetic data.

Tools to fine-tune language models for the stack are on our roadmap. We encourage all language models built for this platform to be open sourced on [HuggingFace](https://huggingface.co/) with the names starting with *dhti-*.

:white_check_mark: **This repository provides a command-line-interface (CLI) to make prototyping easy.**


--- *Join us to make the Gen AI equitable and help doctors save lives!* ---

### :sunglasses: Coming soon

* dhti-elixir-fhire: An elixir for extracting embeddings from FHIR resources for Q&A on patient records.
* dhti-elixir-fhirs: An elixir for text to FHIR search query conversion.
* dhti-elixir-upload: Upload documents to the vector store for patient recommendation and clinical trial matching.
* openmrs-esm-qa: A sample conch for Q&A on patient records using the dhti-elixir-fhire elixir.

## *Try it out! It takes only a few minutes to setup GenAI backed EMR in your local machine!*

## Steps:

:walking:
* Git clone this repository: `git clone https://github.com/dermatologist/dhti.git && cd dhti`
* Install the required packages: `npm install`
* Build the CLI: `npm run build`
* Install CLI locally: `npm link`
* Test the CLI: `dhti-cli help`

### Create a work directory (**Optional**). Default is *~/dhti*
* Create a work directory: `mkdir dhti`

:walking:
### Create a new docker-compose
* Create a new docker-compose file: `dhti-cli compose add -m ollama -m redis -m openmrs -m langserve`

* The docker-compose.yml is created with the following services:
    - Ollama (LLM model server)
    - Redis (Vectorstore)
    - OpenMRS (EMR)
    - LangServe (API for LLM models)

You can read the file by: `dhti-cli compose read`

:walking:
### Start the services
* Start the services: `dhti-cli docker -u`

It may take a while to download the images and start the services. (OpenMRS may take about 30 mins the first time to setup the database)

:walking:
### Download an LLM/Embedding models to use.
* Go to `localhost:8080`
* Create an account and login
* Click on settings, and download the following models
    - phi3:mini
    - all-minilm

:walking:
### Access OpenMRS and login:
* Go to `localhost/openmrs/spa/home`
* Login with the following credentials:
    - Username: admin
    - Password: Admin123

:walking:
### Access the LangServe API
* Go to `localhost:8001/docs` (Empty Swagger UI)

:running:
### *Now let us Install an Elixir (LangServe Template)*

* Let's install the elixir here: https://github.com/dermatologist/dhti-elixir-template

* This elixir template summarizes text based on a simple prompt
* You can use the template to build your own elixirs.

:running:

`dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir-template.git -n dhti-elixir-template`

You may also install from a wheel file (after building it locally with `python setup.py bdist_wheel`. -e path -v version):

`dhti-cli elixir install -e ../dhti-elixir-template/dist/dhti_elixir_template-0.0.1-py3-none-any.whl -n dhti-elixir-template -v 0.0.1`

:running:
### Examine bootstrap.py
`cat ~/dhti/elixir/app/bootstrap.py`

This is where the defaults are defined for *LLM, embedding model, hyperparameters etc that are injected at runtime.*
You can override these defaults by bootstrap in LangServe.

:running:
### Create docker container
`dhti-cli docker -n beapen/genai-test:1.0 -t elixir`

:running:
### Start the container with the new elixir (Optional, you can do it after the next two steps)
`dhti-cli docker -u`

### (Optional) While developing you can copy the dist folder to a running container for testing (provided there are no changes in dependencies)
`dhti-cli elixir dev -d ../dhti-elixir-template -n dhti-elixir-template -c dhti-langserve-1`

:shell:
### *Now let us Install a Conch (OpenMRS O3 Template)*

* Let's install the conch here:https://github.com/dermatologist/openmrs-esm-dhti-template.

* This uses the elixir template to generate a summary.
* You can use the template to build your own conchs.

:shell:

`dhti-cli conch install -g https://github.com/dermatologist/openmrs-esm-dhti-template.git -n openmrs-esm-dhti-template`

We can also install from a dev folder after cloning the repository (-e <path>):

`dhti-cli conch install -e ../openmrs-esm-dhti-template -n openmrs-esm-dhti-template -v 0.0.1`

:shell:
### Create new docker container
`dhti-cli docker -n beapen/conch-test:1.0 -t conch`

:sparkler:
### Start the container with the new conch
`dhti-cli docker -u`

### (Optional) While developing you can copy the dist folder to a running container for testing
`dhti-cli conch dev -d ../openmrs-esm-dhti-template -n openmrs-esm-dhti-template -c dhti-frontend-1`

:sparkler:
### Access the Conch in OpenMRS and test the integration

:clap:
### Remove the services
* Remove the services: `dhti-cli docker -d`


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
* [Dhanvantari (**dhti**)](#dhanvantari-dhti)
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
dhti-cli/0.0.0 linux-x64 node-v19.2.0
$ dhti-cli --help [COMMAND]
USAGE
  $ dhti-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
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
<!-- commandsstop -->
