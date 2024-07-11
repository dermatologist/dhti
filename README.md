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
