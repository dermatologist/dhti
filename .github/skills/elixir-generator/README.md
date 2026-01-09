# DHTI Elixir Generator Skill

This directory contains an AI agent skill for automatically generating DHTI elixir projects from this template.

## Files

- **SKILL.md**: The main skill definition that guides AI agents through the elixir generation process
- **examples/**: Directory containing example requests and use cases
  - **basic-request.md**: General guidance and simple examples
  - **glycemic-example.md**: Detailed example for a glycemic monitoring elixir

## How It Works

When an AI agent accesses this skill, it can:

1. Automatically set up a development environment
2. Scaffold a new DHTI elixir project using cookiecutter
3. Implement FHIR-based data retrieval
4. Create LangChain chains for clinical decision support
5. Generate tests and documentation

## Usage

To use this skill with an AI agent:

1. Ensure your AI agent has access to this skills directory
2. Describe your elixir requirements, including:
   - Clinical functionality needed
   - FHIR resources to query
   - Project name and slug (must start with `dhti-elixir-` / `dhti_elixir_`)
3. The agent will follow the SKILL.md instructions to generate your elixir

## Example Request

```
Please create a DHTI elixir that monitors blood glucose and HbA1c levels 
for diabetes patients over the last 6 months and provides clinical recommendations.
Project name: dhti-elixir-glycemic
Project slug: dhti_elixir_glycemic
```

See the `examples/` directory for more detailed examples.

## Requirements

- The AI agent must have access to execute shell commands
- The development environment needs Python and `uv` package manager
- Network access to clone cookiecutter templates

## Output

The skill generates a complete DHTI elixir project including:

- Fully implemented chain.py and bootstrap.py
- FHIR integration code
- Unit tests
- Documentation (README.md)
- Configuration files (pyproject.toml)

## Support

For more information about DHTI and elixirs, see:
- [DHTI Repository](https://github.com/dermatologist/dhti)
- [DHTI Elixir Template](https://github.com/dermatologist/dhti-elixir-template)
- [Cookiecutter UV](https://github.com/dermatologist/cookiecutter-uv)
