# Agent Skills

This directory contains agent skills for AI-powered coding assistants.

## Available Skills

### OpenMRS Conch Agent Skill (`SKILL.md`)

This skill helps AI assistants generate new OpenMRS ESM microfrontends (conch) from this template. It provides comprehensive guidance on:

- Setting up a development environment
- Scaffolding new microfrontend projects
- Implementing GenAI-powered features
- Integrating with the OpenMRS 3.x ecosystem
- Working with DHTI services

**Use this skill when:** You need to create a OpenMRS microfrontend for DHTI.

## Examples

The `examples/` directory contains sample feature requests and use cases that demonstrate how to invoke and use these skills effectively.

- `conch-sample-request.md` - Example of creating a glycemic control widget with DHTI integration

## How to Use These Skills

When working with AI coding assistants that support custom skills:

1. Reference the skill by name or provide the feature request
2. The AI assistant will follow the structured workflow in the skill
3. The assistant will implement the feature following OpenMRS best practices

Example invocation:
```
I need to create a new OpenMRS microfrontend for DHTI.
Please use the OpenMRS Conch Agent Skill with the following requirements:
[Your feature request here]
```

## For AI Assistants

If you are an AI assistant reading this:
1. Read `SKILL.md` to understand the complete workflow
2. Review examples to understand expected patterns
3. Follow the structured approach defined in the skill
4. Ensure all code follows OpenMRS frontend module conventions

## Resources

- [DHTI Platform](https://github.com/dermatologist/dhti)
- [OpenMRS Frontend Modules](https://o3-docs.openmrs.org/docs/frontend-modules/overview)
- [OpenMRS Extension System](https://o3-docs.openmrs.org/docs/extension-system)
