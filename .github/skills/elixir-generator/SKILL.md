# DHTI Elixir Generator Skill

## Description

This skill enables AI agents to generate new DHTI elixir projects from a cookiecutter template. Elixirs provide backend GenAI capabilities as HTTP endpoints hosted by LangServe. The skill guides the agent through environment setup, project scaffolding using cookiecutter, studying reference implementations, and implementing the requested elixir functionality.

## When to Use This Skill

Use this skill when you need to:
- Create a new DHTI elixir project from scratch
- Generate a LangServe-based backend service with FHIR integration
- Implement clinical decision support services using LangChain
- Build AI-powered EMR chatbot functionalities

## Instructions

You are an elixir coding agent working in a fresh development environment. Check if the instruction includes a working directory setup; if not, create a new directory for the elixir project at ~/dhti/packages/elixirs/<project_name>. Then follow these instructions sequentially.

### Environment setup and project scaffolding

* Check for uv in the dev environment.  Install `uv` in the dev environment if not already installed.
* In the project root, run:

```bash
uvx cookiecutter https://github.com/dermatologist/cookiecutter-uv.git
```

- The user specification for the elixir agent below may include the preferred details for the cookiecutter prompts (author name, email, GitHub handle, open source license). If any of these details are missing, use reasonable guesses.
- When cookiecutter prompts you:
  - **author**: Set to the provided author name (or use a reasonable placeholder if none is given).
  - **email**: Set to the provided email (or use a reasonable placeholder if none is given).
  - **author_github_handle**: Set to the provided GitHub handle (or a reasonable placeholder if none is given).
  - **project_name**: Generate a concise, meaningful project name that reflects the requested features for this Elixir agent. THE NAME MUST START WITH "dhti-elixir-".
  - **project_slug**: Generate a clean, snake_case slug derived from the project name. THE SLUG MUST START WITH "dhti_elixir_".
  - **project_description**: Generate a very brief project description clearly summarizing:
    - the purpose of the project,
    - the kind of Elixir-related functionality requested,
    - the intended clinical / FHIR context (if implied by the request below).
- **Cookiecutter options:**
  - Keep **all cookiecutter options at their default values**, **except**:
    - For select dhti:
      - Set this to 2-y (yes).
    - For open_source_license:
      - If an open source license is **explicitly** mentioned in the request, choose the corresponding option.
      - Otherwise, select **option 7: "Not open source"**.

### Study the reference implementation

Before editing any generated files, **carefully read and understand** the following reference files, paying attention to patterns, structure, and responsibilities:

- **Chain implementation:**
  - chain.py reference:
    - https://github.com/dermatologist/dhti-elixir-template/blob/feature/agent-2/src/dhti_elixir_template/chain.py
    - The main class should be named "DhtiChain" inheriting from BaseChain ( from package dhti_elixir_base)
- **Bootstrap / configuration of the chain:**
  - bootstrap.py reference:
    - https://github.com/dermatologist/dhti-elixir-template/blob/feature/agent-2/src/dhti_elixir_template/bootstrap.py
    - The cds_hook_discovery should be configured as follows:

```python
di["<project_slug>_cds_hook_discovery"] = {  # <- Substitute <project_slug> with the project slug
    "services": [
        {
            "id": "dhti-service",   # <- Keep as is
            "hook": "order-select",  # <- Keep as is
        }
    ]
}
```

Extract and internalize the following from these references:

- How the LangChain chain is constructed (inputs, outputs, prompts, tools, callbacks, etc.).
- How configuration, environment variables, and settings are wired in bootstrap.py.
- How FHIR or other external services are integrated, if present.
- Any conventions for logging, error handling, and dependency injection.

You must follow the **same architectural and stylistic patterns** in the new project's chain.py and bootstrap.py.

### Implement the new Elixir request

Your primary task is to **update the newly created chain.py and bootstrap.py** in the generated project to implement the following user specification:

The DhtiChain should implement the functionality described in the original user request for the elixir.

Interpret below as the high-level functional requirement for the chain. Your implementation should:

- **Align with the reference pattern:**
  - Mirror the structure, abstractions, and flow used in the reference chain.py and bootstrap.py.
  - Reuse naming conventions, configuration style, and initialization patterns where appropriate.
- **FHIR-based data retrieval:**
  - Retrieve any required data using **FHIR search**.
  - Read and carefully study FHIR search here: https://r.jina.ai/https://www.hl7.org/fhir/search.html
  - Read how fhir search is implemented in dhti-elixir-base here: https://github.com/dermatologist/dhti-elixir-base/tree/develop/src/dhti_elixir_base/fhir. This is available as a dependency in the generated project. Hence you can use fhir search functionality from dhti-elixir-base in your implementation and avoid code duplication.
  - Use appropriate FHIR resource types and query parameters based on the needs implied by the original user specification.
  - Implement FHIR interactions in a way that is:
    - Configurable (e.g., via environment variables or settings),
    - Robust (handles typical error conditions),
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
  - Internalize how the agent uses tools if available from the reference chain: https://github.com/dermatologist/dhti-elixir-template/blob/feature/agent-2/src/dhti_elixir_template/chain.py
  - The original user specification will indicate any available tools to use. If none are indicated, you do not have access to any tools.

### Planning: create a TODO list

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
- Run the test suite via uv and ensure all tests pass.

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
- **Functionality:**
  - The chain runs end-to-end for the scenario implied by the original user specification.
  - FHIR calls behave as expected (or are mockable in tests).
  - Configuration is documented and works as described.
- **Project integrity:**
  - All imports resolve.
  - Tests pass.
  - README is up to date.
  - The TODO list accurately reflects what has been completed (you may optionally mark completed tasks).

Your final output should include:

- Updated chain.py and bootstrap.py implementing the requested features,
- Any new/updated tests,
- Updated pyproject.toml (if dependencies were added),
- Updated README.md,
- A clear, up-to-date TODO list (with remaining future improvements, if any).

Now proceed to implement the above steps carefully and methodically.

## Expected Output

A fully functional DHTI elixir project that:
- Follows the architectural patterns of the reference template
- Implements the requested elixir functionality
- Includes proper FHIR integration
- Has comprehensive tests
- Is well-documented
- Can be installed into DHTI using the dhti-cli

## Notes

- The generated elixir must be compatible with the DHTI ecosystem
- FHIR resources and search parameters should follow HL7 FHIR specifications
- The project should use the dhti-elixir-base library for common functionality
- All environment-specific configuration should be externalized
