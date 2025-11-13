
# Copilot Coding Agent Onboarding Guide

## High-Level Overview

- **Repository Purpose:**
	- This repository implements `dhti-cli`, a modular CLI tool (built with [OCLIF](https://oclif.io/docs/api_reference)) for managing, prototyping, and deploying dockerized GenAI, FHIR, and OpenMRS-based applications. It supports rapid development, testing, and orchestration of backend (elixirs) and frontend (conches) modules, with Docker Compose integration.
- **Project Type:**
	- Node.js/TypeScript monorepo, OCLIF CLI, Docker-based microservices, Python backend for elixirs, React-based frontend modules.
- **Languages/Frameworks:**
	- TypeScript (main CLI), Node.js (>=18), OCLIF v4, Python (elixir backend), Docker, Mocha/Chai (testing), ESLint/Prettier (lint/format).
- **Repo Size:**
	- Medium (dozens of source files, multiple resource and test directories, several config and doc files).

## Build, Test, and Validation Instructions

**Environment Setup:**
- Always run `npm install` after cloning or pulling changes.
- Requires Node.js >= 18.0.0 and Docker (for full stack testing). Python is optional unless developing elixirs.

**Build:**
- `npm run build` (Cleans `dist/`, compiles TypeScript, copies resources)
	- Always run after changing TypeScript or resource files.
	- If build fails, ensure all dependencies are installed and TypeScript is available.

**Run CLI:**
- `npm link` (once, to link CLI globally for local testing)
- `dhti-cli help` (shows available commands)
- Example: `dhti-cli compose add -m openmrs -m langserve`

**Test:**
- `npm test` (Runs all Mocha/Chai tests in `test/**/*.test.ts`)
	- Always run after making code changes.
	- Tests are required to pass before PR/merge.

**Lint:**
- `npm run lint` (ESLint checks)
- `npm run fix` (auto-fix lint issues)
	- Linting is required for CI and before PR/merge.

**Docs:**
- `npm run docs` (Generates HTML docs in `docs/`)

**Other Useful Scripts:**
- `npm run readme` (Regenerates CLI command docs in `notes/README.md`)

**Validation/CI:**
- GitHub Actions CI runs on PRs and pushes. It checks build, lint, and test.
- PRs failing CI will be rejected.
- Always validate with `npm run build && npm test && npm run lint` before submitting changes.

**Common Issues & Workarounds:**
- If build/test fails, always try `npm install` and re-run.
- If CLI commands are not found, ensure `npm link` was run after build.
- If Docker Compose fails, ensure Docker is running and all images are built.

## Project Layout & Architecture

- **Root Files:**
	- `package.json`, `tsconfig.json`, `typedoc.json`, `README.md`, `AGENTS.md`, `LICENSE`, `bin/`, `docs/`, `test/`, `src/`, `notes/`, `gateway/`
- **Key Directories:**
	- `src/commands/` — OCLIF CLI commands (compose, conch, elixir, docker, mimic, synthetic)
	- `src/utils/` — Utility classes (CDS Hook models, ChainService, request, etc.)
	- `src/resources/` — Docker build resources (genai backend, spa frontend, compose templates)
	- `test/` — Mocha/Chai tests for commands and utils
	- `docs/` — Generated documentation
	- `notes/` — Markdown docs, usage, and workflow notes
	- `gateway/` — Nginx configs for Docker gateway
- **Config Files:**
	- `tsconfig.json` (TypeScript), `.eslintrc` (ESLint, if present), `typedoc.json` (docs), `package.json` (scripts, deps)
- **Build/Test/Lint:**
	- All scripts are in `package.json` under `scripts`.
- **Docker:**
	- Compose templates in `src/resources/docker-compose-master.yml`.
	- Nginx config in `gateway/nginx.conf`.
	- Elixir backend (Python) in `src/resources/genai/`.
	- Frontend (conch) in `src/resources/spa/`.

## Validation & Pre-Check Steps

- Always run: `npm install` → `npm run build` → `npm test` → `npm run lint` before submitting or merging.
- Validate CLI with `dhti-cli help` and a sample command.
- DO NOT Validate Docker Compose with `docker compose up` (from generated compose file) as it takes lot of time and resources.
- Check for updated docs with `npm run docs`.
- If adding commands, add corresponding tests in `test/commands/`.
- If adding utils, add tests in `test/utils/`.

## Key Facts & Tips

- OCLIF commands are auto-registered from `src/commands/`.
- All CLI flags/options are defined in each command file.
- Linting is strict; always run `npm run fix` if in doubt.
- Trust these instructions; only search if information is missing or in error.

---
**Root directory files:**
	- AGENTS.md, LICENSE, README.md, package.json, tsconfig.json, typedoc.json, bin/, docs/, gateway/, notes/, src/, test/

**For more details:**
	- See `README.md`, `notes/README.md`, and command help (`dhti-cli help`).
