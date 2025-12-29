  # Usage
  <!-- usage -->
```sh-session
$ npm install -g dhti-cli
$ dhti-cli COMMAND
running command...
$ dhti-cli (--version)
dhti-cli/0.6.0 linux-x64 node-v20.19.6
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
* [`dhti-cli docktor [NAME] OP`](#dhti-cli-docktor-name-op)
* [`dhti-cli elixir [OP]`](#dhti-cli-elixir-op)
* [`dhti-cli help [COMMAND]`](#dhti-cli-help-command)
* [`dhti-cli mimic [SERVER]`](#dhti-cli-mimic-server)
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
* [`dhti-cli synthea SUBCOMMAND`](#dhti-cli-synthea-subcommand)
* [`dhti-cli synthetic [INPUT] [OUTPUT] [PROMPT]`](#dhti-cli-synthetic-input-output-prompt)

## `dhti-cli compose [OP]`

Generates a docker-compose.yml file from a list of modules

```
USAGE
  $ dhti-cli compose [OP] [--dry-run] [-f <value>] [-m <value>...]

ARGUMENTS
  [OP]  Operation to perform (add, delete, read or reset)

FLAGS
  -f, --file=<value>       [default: /home/runner/dhti/docker-compose.yml] Full path to the docker compose file to read
                           from. Creates if it does not exist
  -m, --module=<value>...  Modules to add from ( langserve, openmrs, ollama, langfuse, cqlFhir, redis, neo4j, mcpFhir,
                           mcpx and docktor)
      --dry-run            Show what changes would be made without actually making them

DESCRIPTION
  Generates a docker-compose.yml file from a list of modules

EXAMPLES
  $ dhti-cli compose
```

_See code: [src/commands/compose.ts](https://github.com/dermatologist/dhti/blob/v0.6.0/src/commands/compose.ts)_

## `dhti-cli conch [OP]`

Install or uninstall conchs to create a Docker image

```
USAGE
  $ dhti-cli conch [OP] [-b <value>] [-c <value>] [-d <value>] [--dry-run] [-g <value>] [-i <value>] [-n
    <value>] [-v <value>] [-w <value>]

ARGUMENTS
  [OP]  Operation to perform (install, uninstall or dev)

FLAGS
  -b, --branch=<value>       [default: develop] Branch to install from
  -c, --container=<value>    [default: dhti-frontend-1] Name of the container to copy the conch to while in dev mode
  -d, --dev=<value>          [default: none] Dev folder to install
  -g, --git=<value>          [default: none] Github repository to install
  -i, --image=<value>        [default: openmrs/openmrs-reference-application-3-frontend:3.0.0-beta.17] Base image to use
                             for the conch
  -n, --name=<value>         Name of the elixir
  -v, --repoVersion=<value>  [default: 1.0.0] Version of the conch
  -w, --workdir=<value>      [default: /home/runner/dhti] Working directory to install the conch
      --dry-run              Show what changes would be made without actually making them

DESCRIPTION
  Install or uninstall conchs to create a Docker image

EXAMPLES
  $ dhti-cli conch
```

_See code: [src/commands/conch.ts](https://github.com/dermatologist/dhti/blob/v0.6.0/src/commands/conch.ts)_

## `dhti-cli docker [PATH]`

Build a docker project and update docker-compose file

```
USAGE
  $ dhti-cli docker [PATH] [-c <value>] [-d] [--dry-run] [-f <value>] [-n <value>] [-t <value>] [-u]

ARGUMENTS
  [PATH]  [default: /home/runner/dhti] Docker project path to build. Ex: dhti

FLAGS
  -c, --container=<value>  [default: dhti-langserve-1] Name of the container to copy the bootstrap file to while in dev
                           mode
  -d, --down               Run docker-compose down after building
  -f, --file=<value>       [default: /home/runner/dhti/docker-compose.yml] Full path to the docker compose file to edit
                           or run.
  -n, --name=<value>       Name of the container to build
  -t, --type=<value>       [default: elixir] Type of the service (elixir/conch)
  -u, --up                 Run docker-compose up after building
      --dry-run            Show what changes would be made without actually making them

DESCRIPTION
  Build a docker project and update docker-compose file

EXAMPLES
  $ dhti-cli docker
```

_See code: [src/commands/docker.ts](https://github.com/dermatologist/dhti/blob/v0.6.0/src/commands/docker.ts)_

## `dhti-cli docktor [NAME] OP`

Manage inference pipelines for MCPX

```
USAGE
  $ dhti-cli docktor [NAME] OP [-c <value>] [-e <value>...] [-i <value>] [-m <value>] [-w <value>]

ARGUMENTS
  [NAME]  Name of the inference pipeline (e.g., skin-cancer-classifier)
  OP      Operation to perform (install, remove, restart, list)

FLAGS
  -c, --container=<value>       [default: dhti-mcpx-1] Docker container name for MCPX (use docker ps to find the correct
                                name)
  -e, --environment=<value>...  Environment variables to pass to docker (format: VAR=value)
  -i, --image=<value>           Docker image for the inference pipeline (required for install)
  -m, --model-path=<value>      [default: /lunar/packages/mcpx-server/config] Local path to the model directory
                                (optional for install)
  -w, --workdir=<value>         [default: /home/runner/dhti] Working directory for MCPX config

DESCRIPTION
  Manage inference pipelines for MCPX

EXAMPLES
  $ dhti-cli docktor install my-pipeline --image my-image:latest --model-path ./models

  $ dhti-cli docktor remove my-pipeline

  $ dhti-cli docktor list
```

_See code: [src/commands/docktor.ts](https://github.com/dermatologist/dhti/blob/v0.6.0/src/commands/docktor.ts)_

## `dhti-cli elixir [OP]`

Install or uninstall elixirs to create a Docker image

```
USAGE
  $ dhti-cli elixir [OP] [-b <value>] [-c <value>] [-d <value>] [--dry-run] [-g <value>] [-n <value>] [-p
    <value>] [-v <value>] [-e <value>] [-w <value>]

ARGUMENTS
  [OP]  Operation to perform (install, uninstall or dev)

FLAGS
  -b, --branch=<value>       [default: develop] Branch to install from
  -c, --container=<value>    [default: dhti-langserve-1] Name of the container to copy the elixir to while in dev mode
  -d, --dev=<value>          [default: none] Dev folder to install
  -e, --whl=<value>          [default: none] Whl file to install
  -g, --git=<value>          [default: none] Github repository to install
  -n, --name=<value>         Name of the elixir
  -p, --pypi=<value>         [default: none] PyPi package to install. Ex: dhti-elixir-base = ">=0.1.0"
  -v, --repoVersion=<value>  [default: 0.1.0] Version of the elixir
  -w, --workdir=<value>      [default: /home/runner/dhti] Working directory to install the elixir
      --dry-run              Show what changes would be made without actually making them

DESCRIPTION
  Install or uninstall elixirs to create a Docker image

EXAMPLES
  $ dhti-cli elixir
```

_See code: [src/commands/elixir.ts](https://github.com/dermatologist/dhti/blob/v0.6.0/src/commands/elixir.ts)_

## `dhti-cli help [COMMAND]`

Display help for dhti-cli.

```
USAGE
  $ dhti-cli help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for dhti-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.36/src/commands/help.ts)_

## `dhti-cli mimic [SERVER]`

Submit a FHIR request to a server

```
USAGE
  $ dhti-cli mimic [SERVER] [--dry-run] [-t <value>]

ARGUMENTS
  [SERVER]  [default: http://localhost/fhir/$import] Server URL to submit

FLAGS
  -t, --token=<value>  Bearer token for authentication (optional)
      --dry-run        Show what changes would be made without actually making them

DESCRIPTION
  Submit a FHIR request to a server

EXAMPLES
  $ dhti-cli mimic
```

_See code: [src/commands/mimic.ts](https://github.com/dermatologist/dhti/blob/v0.6.0/src/commands/mimic.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/index.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/inspect.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/install.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/link.ts)_

## `dhti-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ dhti-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/reset.ts)_

## `dhti-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ dhti-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/uninstall.ts)_

## `dhti-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ dhti-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.54/src/commands/plugins/update.ts)_

## `dhti-cli synthea SUBCOMMAND`

Manage Synthea synthetic FHIR data generation

```
USAGE
  $ dhti-cli synthea SUBCOMMAND [-a <value>] [-c <value>] [--covid19] [--covid19_10k] [--covid19_csv]
    [--covid19_csv_10k] [--dry-run] [-e <value>] [-g M|F] [-p <value>] [-s <value>] [--state <value>]
    [--synthea_sample_data_csv_latest] [--synthea_sample_data_fhir_latest] [--synthea_sample_data_fhir_stu3_latest] [-t
    <value>] [-w <value>]

ARGUMENTS
  SUBCOMMAND  (install|generate|upload|delete|download) Subcommand to execute: install, generate, upload, delete,
              download

FLAGS
  -a, --age=<value>                           Generate patients with specific age range (e.g., "0-18" for pediatric)
  -c, --city=<value>                          City for patient generation
  -e, --endpoint=<value>                      [default: http://fhir:8005/baseR4] FHIR server endpoint URL
  -g, --gender=<option>                       Generate patients of specific gender (M or F)
                                              <options: M|F>
  -p, --population=<value>                    [default: 1] Number of patients to generate
  -s, --seed=<value>                          Random seed for reproducible generation
  -t, --token=<value>                         Bearer token for FHIR server authentication
  -w, --workdir=<value>                       [default: /home/runner/dhti] Working directory for Synthea files
      --covid19                               Download COVID-19 dataset (1k patients)
      --covid19_10k                           Download COVID-19 dataset (10k patients)
      --covid19_csv                           Download COVID-19 CSV dataset (1k patients)
      --covid19_csv_10k                       Download COVID-19 CSV dataset (10k patients)
      --dry-run                               Show what changes would be made without actually making them
      --state=<value>                         State for patient generation (default: Massachusetts)
      --synthea_sample_data_csv_latest        Download latest CSV sample data
      --synthea_sample_data_fhir_latest       Download latest FHIR sample data
      --synthea_sample_data_fhir_stu3_latest  Download latest FHIR STU3 sample data

DESCRIPTION
  Manage Synthea synthetic FHIR data generation

EXAMPLES
  $ dhti-cli synthea install

  $ dhti-cli synthea generate -p 10

  $ dhti-cli synthea upload -e http://fhir:8005/baseR4

  $ dhti-cli synthea delete

  $ dhti-cli synthea download --covid19
```

_See code: [src/commands/synthea.ts](https://github.com/dermatologist/dhti/blob/v0.6.0/src/commands/synthea.ts)_

## `dhti-cli synthetic [INPUT] [OUTPUT] [PROMPT]`

Generate synthetic data using LLM

```
USAGE
  $ dhti-cli synthetic [INPUT] [OUTPUT] [PROMPT] [--dry-run] [-i input|instruction|output] [-m <value>] [-r
    <value>] [-o input|instruction|output]

ARGUMENTS
  [INPUT]   Input file to process
  [OUTPUT]  Output file to write
  [PROMPT]  Prompt file to read

FLAGS
  -i, --inputField=<option>   [default: input] Input field to use
                              <options: input|instruction|output>
  -m, --maxCycles=<value>     Maximum number of cycles to run
  -o, --outputField=<option>  [default: output] Output field to use
                              <options: input|instruction|output>
  -r, --maxRecords=<value>    [default: 10] Maximum number of records to generate
      --dry-run               Show what changes would be made without actually making them

DESCRIPTION
  Generate synthetic data using LLM

EXAMPLES
  $ dhti-cli synthetic
```

_See code: [src/commands/synthetic.ts](https://github.com/dermatologist/dhti/blob/v0.6.0/src/commands/synthetic.ts)_
<!-- commandsstop -->
  # Table of contents
  <!-- toc -->

<!-- tocstop -->
