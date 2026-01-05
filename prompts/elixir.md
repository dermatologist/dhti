# DHTI elixir coding agent

Elixirs provide backend GenAI capabilities as HTTP endpoints hosted by LangServe. You are a elixir coding agent working in a fresh development environment. Follow these instructions **strictly and sequentially**.

## Environment setup and project scaffolding

* Install \`uv\` in the dev environment\*\* (if not already installed).
* In the project root, run:

```bash

uvx cookiecutter https://github.com/dermatologist/cookiecutter-uv.git

```

- When cookiecutter prompts you:
  - **author**: Set to the provided author name (or use a reasonable placeholder if none is given).
  - **email**: Set to the provided email (or use a reasonable placeholder if none is given).
  - **author_github_handle**: Set to the provided GitHub handle (or a reasonable placeholder if none is given).
  - **project_name**: Generate a concise, meaningful project name that reflects the requested features for this Elixir agent.
  - **project_slug**: Generate a clean, snake_case slug derived from the project name.
  - **project_description**: Generate a detailed project description clearly summarizing:
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

## Study the reference implementation

Before editing any generated files, **carefully read and understand** the following reference files, paying attention to patterns, structure, and responsibilities:

- **Chain implementation:**
  - chain.py reference:
    - <https://github.com/dermatologist/dhti-elixir-template/blob/feature/agent-2/src/dhti_elixir_template/chain.py>
- **Bootstrap / configuration of the chain:**
  - bootstrap.py reference:
    - <https://github.com/dermatologist/dhti-elixir-template/blob/feature/agent-2/src/dhti_elixir_template/bootstrap.py>

Extract and internalize the following from these references:

- How the LangChain chain is constructed (inputs, outputs, prompts, tools, callbacks, etc.).
- How configuration, environment variables, and settings are wired in bootstrap.py.
- How FHIR or other external services are integrated, if present.
- Any conventions for logging, error handling, and dependency injection.

You must follow the **same architectural and stylistic patterns** in the new project's chain.py and bootstrap.py.

## Implement the new Elixir request

Your primary task is to **update the newly created chain.py and bootstrap.py** in the generated project to implement the following specification:

&lt;new elixir request here&gt;

Interpret this as the high-level functional requirement for the chain. Your implementation should:

- **Align with the reference pattern:**
  - Mirror the structure, abstractions, and flow used in the reference chain.py and bootstrap.py.
  - Reuse naming conventions, configuration style, and initialization patterns where appropriate.
- **FHIR-based data retrieval:**
  - Retrieve any required data using **FHIR search**.
  - Read and carefully study FHIR search here: <https://r.jina.ai/https://www.hl7.org/fhir/search.html>
  - Use appropriate FHIR resource types and query parameters based on the needs implied by the &lt;new elixir request here&gt; specification.
  - Implement FHIR interactions in a way that is:
    - Configurable (e.g., via environment variables or settings),
    - Robust (handles typical error conditions),
    - Consistent with the reference template's practices (if defined there).
- **Dependencies and package usage:**
  - Prefer existing dependencies and standard library where possible.
  - Only introduce **additional Python packages** when clearly necessary.
  - If you add any new package:
    - Add it to pyproject.toml as a dependency in the appropriate section.
    - Ensure compatibility with the existing project structure (e.g., version constraints if needed).
- **Chain behavior:**
  - Define the chain's inputs, outputs, and key steps clearly.
  - Ensure the chain logic fulfills all aspects of &lt;new elixir request here&gt;, including:
    - Any domain logic surrounding Elixir code analysis, generation, or orchestration.
    - Any interactions with external services (e.g., FHIR, LLMs, tools) as appropriate.

## 4\. Planning: create a TODO list

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

## Implementation details

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

## Testing

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
- Run the test suite (e.g., via uv or the project's recommended test command) and ensure all tests pass.

## Documentation

- **Update README.md** to reflect the new functionality:
  - Add or update sections describing:
    - The purpose and scope of the project.
    - The behavior of the chain and what &lt;new elixir request here&gt; means in practice.
    - How to configure FHIR endpoints and any relevant environment variables.
    - How to run the chain, including command examples.
    - How to run tests.
- Ensure the README is clear and suitable for:
  - Developers integrating or extending the chain,
  - Clinicians or researchers trying to understand the high-level purpose (if relevant).

## Final quality pass

Perform a **final pass** over the project to ensure:

- **Code quality:**
  - Code is idiomatic, consistent with the reference style, and well-structured.
  - No obvious dead code, unused variables, or leftover debug prints.
  - Type hints are used where appropriate (if consistent with the template).
- **Functionality:**
  - The chain runs end-to-end for at least one realistic scenario implied by &lt;new elixir request here&gt;.
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