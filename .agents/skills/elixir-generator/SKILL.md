---
name: elixir-generator
description: This skill enables AI agents to generate new DHTI elixir project. Elixirs provide backend GenAI capabilities as HTTP endpoints hosted by LangServe. The skill guides the agent through environment setup, project scaffolding, studying reference implementations, and implementing the requested elixir functionality.
---

## When to Use This Skill

Use this skill when you need to:

- Create a new DHTI elixir project from scratch
- Generate a LangServe-based backend service with FHIR integration
- Implement clinical decision support services
- Build AI-powered EMR chatbot functionalities

## Best Practices

- Each elixir should focus ONLY on a single function. (e.g. file upload and glycemic recommender should be separate elixirs). If multiple functionalities are needed, create multiple elixirs and orchestrate them.
- Reuse existing elixirs where possible instead of creating new ones. You may refer to the list of existing elixirs in the DHTI monorepo: https://github.com/dermatologist/dhti-elixir#available-elixirs
- Always create a README.md file in the package root documenting the purpose, functionality, and usage of the elixir, including additional configuration steps if any as well as other elixirs or services it depends on and needs to be installed alongside.
- If a RAG pattern is needed, use redis vector stores. Use neo4j to represent complex graphs. Read src/resources/docker-compose-master.yml to understand how redis and neo4j containers will be spun up. Prefer using existing elixirs if any and mention the dependency in README.md.
- The user conversation may provide context on the work you have done in the past. Always internalize that and reuse it where possible.
- **Clinical Safety:** For CDS elixirs, implement input validation, evidence/source attribution, explicit uncertainty handling, safe fallbacks, PHI minimization, audit logging, and clear non-clinical/disclaimer policies.

### Preflight Checks

Before starting, verify the following prerequisites:

1. **Python:** Ensure Python 3.10+ is installed (`python --version`)
2. **Package Manager:** `uv` is recommended for dependency management
3. **Docker:** Required for running the elixir in development
4. **Git and Network:** Required for template cloning via `degit`
5. **CLI Source:** Determine if you're using:
   - **Published CLI:** `npx dhti-cli` (uses the latest published version)
   - **Local CLI:** If developing the CLI itself, run `npm install`, `npm run build`, and `npm link` in the dhti-cli repository, then verify with `dhti-cli --version`
6. **Workspace:** Ensure the target workspace directory doesn't already contain conflicting files

### Environment Setup and Project Scaffolding

- **Use this ONLY if you are creating a new elixir project from scratch.** If you already have an existing elixir project, you can skip the scaffolding step and proceed directly to "Implementation Steps" below.

- **Read and internalize the original user feature request:**
  - Understand the clinical functionality needed.
  - Identify whether FHIR integration is required (not all elixirs need FHIR).
  - Determine if CDS Hooks integration is needed and which hook type (e.g., `order-select`, `patient-view`, `medication-prescribe`).

- **Decide on a simple but unique name** for your backend. (e.g., glycemic, heart_rate, skin_tone etc.). IN THE INSTRUCTIONS BELOW, REPLACE `<<name>>` WITH YOUR CHOSEN NAME.

- **Scaffold a new elixir project** using the DHTI cli:

**Dry-run first (recommended):**

```bash
npx dhti-cli elixir init -w workspace -n <<name>> --dry-run
```

**Execute scaffolding:**

```bash
npx dhti-cli elixir init -w workspace -n <<name>>
```

This creates:

- `workspace/dhti-elixir/` — the monorepo root
- `workspace/dhti-elixir/packages/<<name>>/` — your elixir package

**Idempotency:** If the target directory already exists or contains uncommitted changes, the command will fail. Remove or rename the existing directory before retrying.

- **Adapt the starter implementation**
  - The CLI copies `packages/starter` to `packages/<<name>>`
  - Rename the package directory from `dhti_elixir_starter` to `dhti_elixir_<<name>>` inside `workspace/dhti-elixir/packages/<<name>>/`
  - Replace "starter" with your chosen name in:
    - Package directory name
    - `pyproject.toml` package name
    - Import statements
    - Module references
  - Verify the package structure matches the expected layout below.

### Planning: create a TODO list if not completed in previous steps

Before writing or heavily modifying code, create an **elaborate, structured TODO list** in a notes/todo.md file. This TODO list should:

- Break the work into small, concrete tasks.
- Cover:
  - **Environment & setup** (if anything beyond cookiecutter defaults is needed),
  - **Chain design** (inputs/outputs, internal steps, FHIR interactions),
  - **Implementation tasks** for chain.py and bootstrap.py,
  - **Dependency updates** (if new packages are needed),
  - **Unit testing** tasks,
  - **Documentation updates** (README),
  - **Validation and final checks**.

Use clear, actionable items that you can check off logically as you progress.

## Implementation Steps

- YOU WILL DO WORK IN THIS NEWLY GENERATED PROJECT GOING FORWARD. The rest of the project files can be used for reference but you should not modify them directly.
  - Extract and internalize the following from other packages such as simple_chat in the monorepo:
    - How the LangChain chain is constructed (inputs, outputs, prompts, tools, callbacks, etc.).
    - How configuration, environment variables, and settings are wired in bootstrap.py.
    - How FHIR or other external services are integrated, if present.
    - Any conventions for logging, error handling, and dependency injection.

- You must follow the **same architectural and stylistic patterns** in the <<name>> project's chain.py and bootstrap.py.
  - chain.py:
    - The main class should be named "DhtiChain" inheriting from BaseChain (from package dhti_elixir_base)
    - The main LLM and optionally a function calling LLM should be injected while bootstrapping as `di["main_llm"]` and `di["function_llm"]` respectively. The default prompt should also be injected as `di["main_prompt"]`. Additional hyperparameters can be injected as needed.
    - **Chain Contract:**
      - Implement `_call` method that accepts input and returns output
      - Define input/output schemas using Pydantic models
      - Handle CDS request context if applicable
      - Implement timeout, retry, and no-result behavior
      - Avoid logging PHI or secrets
    - Plan how the problem can be solved using LangChain constructs (chains, agents, tools, callbacks, etc.) following the patterns in the reference chain.py.

- YOUR TASK is to **update the newly created chain.py and bootstrap.py** in the generated project to implement the user specifications described in the original user request for the elixir. Use subagents if needed to break down the problem into smaller steps. You can also create additional helper classes or functions within chain.py if needed, but avoid creating new files unless absolutely necessary.

* **Bootstrap / configuration of the chain:**
  - bootstrap.py:
    - This file is responsible for setting up dependency injection (DI) for the chain, including:
      - Configuring the main LLM and function calling LLM (if applicable).
      - Setting up prompts and any additional tools or services.
      - Configuring FHIR endpoints and any other external services.
    - Add default `FakeListLLM` configuration for both main_llm and function_llm if not specified in the user request:

```python
from langchain_community.llms.fake import FakeListLLM
di["main_llm"] = FakeListLLM(responses=["I am a fake LLM", "I don't know"])
di["function_llm"] = FakeListLLM(responses=["I am a fake LLM"])
```

    - **CDS Hooks configuration (conditional):** Only configure `cds_hook_discovery` if the elixir is intended for CDS Hooks integration. The hook type should match the clinical use case:

```python
di["cds_hook_discovery"] = {
    "services": [
        {
            "id": "dhti-service",
            "hook": "order-select",  # Use appropriate hook: order-select, patient-view, medication-prescribe, etc.
            "title": "MyOrg Order Assistant",
            "description": "Provides suggestions and actions for selected draft orders.",
            "prefetch": {
                "patient": "Patient/{{context.patientId}}",
                "draftOrders": "Bundle?patient={{context.patientId}}&status=draft",
            },
            "scopes": [
                "launch",
                "patient/Patient.read",
                "user/Practitioner.read",
                "patient/CommunicationRequest.read",
            ],
            "metadata": {
                "author": "MyOrg CDS Team",
                "version": "1.0.0",
                "supportedResources": ["CommunicationRequest"],
            },
        }
    ]
}
```

    - **Important:** The hook type (`order-select`, `patient-view`, `medication-prescribe`, etc.) must match the clinical workflow. Do not default to `order-select` for all elixirs.

### Directory Structure

```
workspace/
└── dhti-elixir/
    └── packages/
        └── <name>/                # Your generated elixir package
            ├── notes/
            │   └── todo.md          # Your detailed TODO list and plan
            ├── src/dhti_elixir_<name>/   # Main code for the elixir
            │   ├── __init__.py
            │   ├── chain.py              # Main chain implementation
            │   ├── bootstrap.py          # Bootstrap/configuration file
            │   └── (other files, e.g., utils.py)
            ├── pyproject.toml            # Add new dependencies here
            ├── README.md                 # Package documentation
            └── tests/
                └── test_chain.py         # Example test file for chain.py
```

**Note:** Conch (frontend) generation is handled by the `conch-generator` skill. This skill focuses solely on elixir (backend) generation.

## High level functional requirements for chain.py and bootstrap.py implementation

- **Align with the reference pattern:**
  - Mirror the structure, abstractions, and flow used in the reference chain.py and bootstrap.py.
  - Reuse naming conventions, configuration style, and initialization patterns where appropriate.
- **FHIR-based data retrieval (conditional):**
  - **Only implement FHIR integration if the user request requires it.** Not all elixirs need FHIR.
  - If FHIR is needed:
    - Retrieve data using **FHIR search**.
    - Study FHIR search here: https://www.hl7.org/fhir/search.html
    - Use the FHIR utilities from `dhti-elixir-base` (available as a dependency in the generated project). This avoids code duplication.
    - Use appropriate FHIR resource types and query parameters based on the needs implied by the original user specification.
    - Implement FHIR interactions in a way that is:
      - Configurable (e.g., via environment variables or settings),
      - Robust (handles typical error conditions),
      - Testable (mockable in unit tests).
- **Dependencies and package usage:**
  - Prefer existing dependencies and standard library where possible.
  - Only introduce **additional Python packages** when clearly necessary.
  - If you add any new package:
    - Add it to pyproject.toml as a dependency in the appropriate section.
    - Ensure compatibility with the existing project structure (e.g., version constraints if needed).
- **Chain behavior:**
  - Define the chain's inputs, outputs, and key steps clearly.
  - Ensure the chain logic fulfills all aspects of user request, including:
    - Any domain logic surrounding Elixir code analysis, generation, or orchestration.
    - Any interactions with external services (e.g., FHIR, LLMs, tools) as appropriate.
- **Tools** (if applicable):
  - Internalize how the agent uses tools if available from the package agent_chat in the monorepo.
  - The original user specification will indicate any available tools to use. If none are indicated, you do not have access to any tools.

### Implementation details

- **Update chain.py:**
  - Implement the chain logic following the patterns from the reference chain.py.
  - Integrate FHIR search where needed.
  - Ensure the chain is testable, modular, and readable.
  - Include inline comments where non-trivial logic is implemented.
- **Update bootstrap.py:**
  - Configure the chain, environment variables, and external services following the patterns of the reference bootstrap.py.
  - Ensure:
    - FHIR endpoint configuration is clearly defined (and overridable),
    - Logging and error handling are consistent with the reference style,
    - Any secrets or sensitive settings are expected via environment variables or configuration files, not hard-coded.
- **Dependency management:**
  - If you added new packages:
    - Confirm they are correctly listed in pyproject.toml.
    - Ensure any import paths are correct and code runs without import errors.

### Testing

- **Write unit tests** for the new behavior:
  - Place tests in the appropriate test directory or module, consistent with the generated project's testing structure.
  - Cover:
    - Core chain behavior (including expected inputs/outputs),
    - FHIR search integration (using mocks where appropriate),
    - Configuration behavior in bootstrap.py (e.g., how environment variables/config affect the chain).
- Ensure tests:
  - Are deterministic,
  - Avoid real external network calls when possible (use mocking or fixtures),
  - Use clear, descriptive test names.
- **Run tests:**

  ```bash
  # Install dependencies
  uv sync --dev

  # Run tests
  uv run pytest

  # Run with coverage
  uv run pytest --cov=dhti_elixir_<<name>>
  ```

- **Test patterns:**
  - Mock LLM responses using `FakeListLLM`
  - Mock FHIR responses using fixtures or `unittest.mock`
  - Test edge cases: empty results, errors, timeouts
  - Validate input/output schemas

### Documentation

- **Update README.md** to reflect the new functionality:
  - Add or update sections describing:
    - The purpose and scope of the project.
    - The behavior of the chain and what it means in practice.
    - How to configure FHIR endpoints and any relevant environment variables.
    - How to run the chain, including command examples.
    - How to run tests.
- Ensure the README is clear and suitable for:
  - Developers integrating or extending the chain,
  - Clinicians or researchers trying to understand the high-level purpose (if relevant).

### Final quality pass

Perform a **final pass** over the project to ensure:

- **Code quality:**
  - Code is idiomatic, consistent with the reference style, and well-structured.
  - No obvious dead code, unused variables, or leftover debug prints.
  - Type hints are used where appropriate (if consistent with the template).
  - No PHI or secrets logged.
- **Functionality:**
  - The chain runs end-to-end for the scenario implied by the original user specification.
  - FHIR calls behave as expected (or are mockable in tests).
  - Configuration is documented and works as described.
- **Clinical safety (for CDS elixirs):**
  - Input validation is implemented
  - Evidence/source attribution is provided
  - Uncertainty is explicitly handled
  - Safe fallbacks are in place
  - PHI is minimized
  - Audit logging is implemented
  - Non-clinical/disclaimer policies are clear
- **Project integrity:**
  - All imports resolve.
  - Tests pass.
  - README is up to date.
  - The TODO list accurately reflects what has been completed (you may optionally mark completed tasks).

Your final output for the current iteration may include:

- Updated chain.py and bootstrap.py implementing the requested features,
- Any new/updated tests,
- Updated pyproject.toml (if dependencies were added),
- Updated README.md,
- A clear, up-to-date TODO list (with remaining future improvements, if any).

Now proceed to implement the above steps carefully and methodically.

## Notes

- The generated elixir must be compatible with the DHTI ecosystem
- FHIR resources and search parameters should follow HL7 FHIR specifications
- The project should use the dhti-elixir-base library for common functionality
- All environment-specific configuration should be externalized
