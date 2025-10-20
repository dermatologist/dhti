# Agent Instructions for DHTI Repository


## Overview

DHTI is a oclif based CLI tool designed to facilitate the management and deployment of dockerized applications.
The src/resources directory contains resources that go into docker images built by DHTI.
The commands directory contains the CLI commands that users can execute.
The utils directory contains utility functions used across the codebase.
The docker-compose-master.yml file is the main file from which specific docker-compose files are generated.


## Repository Structure

The repository is organized as follows:

- `src/commands/`: OCLIF CLI commands (compose, conch, elixir, docker, mimic, synthetic)
- `src/utils/`: Utility functions and models (CDS Hook models, ChainService, request handling, etc.)
- `src/resources/`: Resources for Docker images
	- `docker-compose-master.yml`: Master compose file for generating service-specific docker-compose files
	- `genai/`: Python backend for elixirs (includes Dockerfile, pyproject.toml, app/)
	- `spa/`: Frontend resources for conches (includes Dockerfile, def/)
- `bin/`: Entrypoints for CLI execution
- `test/`: Unit and integration tests for commands and utilities
- `docs/`: Generated documentation and HTML assets
- `notes/`: Markdown documentation, setup guides, and workflow notes

## Development Workflow

1. **Setup**: Install Node.js and Docker. Optionally, Python for elixir development.
2. **Install dependencies**: `npm install`
3. **Build CLI**: `npm run build`
4. **Link CLI locally**: `npm link`
5. **Run CLI**: `dhti-cli help` to view available commands
6. **Try out features**: See `notes/steps.md` for step-by-step usage and prototyping
7. **Working directory**: By default, `~/dhti` is used for generated files and resources

## Code Style and Conventions

- **Language**: TypeScript (strict mode, ES2022 target)
- **CLI Framework**: OCLIF v4
- **Naming**: Elixirs prefixed with `dhti-elixir-`, conches with `openmrs-esm-`
- **Modularity**: Each command and utility is a separate file/class
- **Resources**: Docker images and compose files are generated from templates in `src/resources/`
- **Testing**: Use Mocha/Chai for unit tests; test files mirror source structure
- **Formatting**: Use Prettier and ESLint (`npm run lint`)

## Common Tasks for Agents

- **Add a new CLI command**: Create a new file in `src/commands/`, export a class extending OCLIF `Command`
- **Add a utility/model**: Place in `src/utils/`, export as needed
- **Update docker-compose logic**: Edit `src/commands/compose.ts` and/or `src/resources/docker-compose-master.yml`
- **Add or update resources**: Place Dockerfiles, config, or templates in `src/resources/`
- **Write tests**: Add test files in `test/commands/` or `test/utils/` using Mocha/Chai
- **Document features/workflow**: Update markdown files in `notes/` or `docs/`
- **Copy dev resources to containers**: Use `dhti-cli elixir dev ...` or `dhti-cli conch dev ...` (see `notes/dev-copy.md`)

## Testing Strategy

- **Unit tests**: All commands and utilities have corresponding tests in `test/`
- **Test framework**: Mocha/Chai, with OCLIF test helpers
- **Run tests**: `npm test`
- **Coverage**: Ensure new features/commands/utilities have tests
- **Test conventions**: Mirror source structure, use descriptive test names
- **Integration**: Test CLI flows and Docker interactions where possible

## Additional Agent Guidelines

- **Follow modular and extensible patterns**: Prefer adding new files/classes over modifying large blocks
- **Use environment variables for configuration**
- **Prefer updating documentation in `notes/` for new workflows or troubleshooting**
- **Reference templates for elixirs/conches in README and notes**
- **Check for existing tests before refactoring or adding features**
- **Use the provided CLI flags and options for all commands**
- **Consult `notes/README.md` and `README.md` for command details and examples**

For further details, see the README, notes, and test files. Agents should keep documentation and tests up to date with code changes.
