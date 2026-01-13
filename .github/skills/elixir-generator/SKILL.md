# DHTI Elixir Generator Skill

## Description

This skill enables AI agents to generate new DHTI elixir projects. Elixirs provide backend GenAI capabilities as HTTP endpoints hosted by LangServe. The skill guides the agent through environment setup, project scaffolding, studying reference implementations, and implementing the requested elixir functionality.

## When to Use This Skill

Use this skill when you need to:
- Create a new DHTI elixir project from scratch
- Generate a LangServe-based backend service with FHIR integration
- Implement clinical decision support services using LangChain
- Build AI-powered EMR chatbot functionalities

## Instructions

You are an elixir coding agent working in a fresh development environment.

### Environment Setup and Project Scaffolding

1. **Install and link the DHTI cli, if you are not already in the dhti repository**:**
   ```bash
    git clone https://github.com/dermatologist/dhti
    cd dhti
    ```

2. **Install and Link** the DHTI cli:**
   ```bash
    npm install
    npm link
   ```

3. **Read and internalize the original user feature request:**
   - Understand the clinical functionality needed.

4. **Decide on a simple but unique name** for your backend. (e.g., glycemic, heart_rate, skin_tone etc.). IN THE INSTRUCTIONS BELOW, REPLACE `<<name>>` WITH YOUR CHOSEN NAME.

5. **Scaffold a new microfrontend project** using the DHTI cli:
   ```bash
   dhti-cli elixir init -w workspace -n <<name>>
   ```

6. **Study the reference implementation. carefully read and understand** the following reference files, paying attention to patterns, structure, and responsibilities:

- **Implementation:**
  - chain.py:
    - The main class should be named "DhtiChain" inheriting from BaseChain ( from package dhti_elixir_base)
    - The main LLM and optionally a function calling LLM should be injected while bootstrapping as di["<project_slug>_main_llm"] and di["<project_slug>_function_llm"] respectively. Substitute <project_slug> with the project slug. The default prompt should also be injected as di["<project_slug>_prompt"]. Additional hyperparameters can be injected as needed.
    - Plan how the problem can be solved using LangChain constructs (chains, agents, tools, callbacks, etc.) following the patterns in the reference chain.py.
- **Bootstrap / configuration of the chain:**
  - bootstrap.py:
    - This file is responsible for setting up dependency injection (DI) for the chain, including:
      - Configuring the main LLM and function calling LLM (if applicable).
      - Setting up prompts and any additional tools or services.
      - Configuring FHIR endpoints and any other external services.
    - Add default FakeChatLLM configuration for both main_llm and function_llm if not specified in the user request.
    - The cds_hook_discovery should be configured as follows:

```python
di["<<name>>_cds_hook_discovery"] = {  # <- Substitute <project_slug> with the project slug
    "services": [
        {
            "id": "dhti-service",   # <- Keep as is
            "hook": "order-select",  # <- Keep as is
        }
    ]
}
```

Extract and internalize the following from other packages such as simple_chat in the monorepo:

- How the LangChain chain is constructed (inputs, outputs, prompts, tools, callbacks, etc.).
- How configuration, environment variables, and settings are wired in bootstrap.py.
- How FHIR or other external services are integrated, if present.
- Any conventions for logging, error handling, and dependency injection.

You must follow the **same architectural and stylistic patterns** in the <<name>> project's chain.py and bootstrap.py.

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
  - Internalize how the agent uses tools if available from the package agent_chat in the monorepo.
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
