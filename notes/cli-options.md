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
