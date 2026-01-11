# DHTI Agent Skills

## Overview

DHTI provides AI agent skills that enable automated generation and orchestration of GenAI healthcare applications. These skills are designed to work with AI coding assistants like GitHub Copilot, Claude, and other AI development tools.

## What are Agent Skills?

Agent skills are specialized instruction sets that guide AI assistants through complex development workflows. They provide:

- **Structured guidance**: Step-by-step instructions for specific tasks
- **Domain knowledge**: Context about DHTI, FHIR, OpenMRS, and healthcare standards
- **Best practices**: Conventions and patterns specific to DHTI development
- **Quality assurance**: Testing and validation steps

## Available Skills

DHTI includes three main skills located in `.github/skills/` and `.claude/skills/`:

### 1. elixir-generator

**Purpose**: Generate DHTI elixir projects (backend GenAI services)

**Capabilities**:
- Scaffold new elixir projects using cookiecutter
- Implement FHIR-based data retrieval
- Create LangChain chains for clinical logic
- Generate tests and documentation
- Follow dhti-elixir-base patterns

**When to use**:
- Creating new backend GenAI functionality
- Implementing clinical decision support
- Building FHIR-integrated AI services
- Developing LangServe applications

**Example invocation**:
```
Create a DHTI elixir that monitors blood glucose levels and provides 
diabetes management recommendations. Query FHIR Observation resources 
for the last 6 months. Project name: dhti-elixir-glycemic.
```

**Documentation**: [.github/skills/elixir-generator/](../.github/skills/elixir-generator/)

### 2. conch-generator

**Purpose**: Generate DHTI conch projects (frontend UI components)

**Capabilities**:
- Scaffold new OpenMRS ESM microfrontends
- Implement patient-context-aware UI
- Integrate with DHTI services
- Create routes and extensions
- Generate tests and documentation

**When to use**:
- Creating new frontend UI components
- Building patient chart widgets
- Implementing chat interfaces
- Developing OpenMRS extensions

**Example invocation**:
```
Create an OpenMRS conch that displays glycemic control information
in the patient chart conditions tab. Show latest HbA1c and glucose
readings with AI recommendations. Project name: openmrs-esm-dhti-glycemic.
```

**Documentation**: [.github/skills/conch-generator/](../.github/skills/conch-generator/)

### 3. start-dhti (New)

**Purpose**: Orchestrate complete DHTI application development

**Capabilities**:
- Invoke elixir-generator to create backend
- Invoke conch-generator to create frontend
- Set up DHTI infrastructure (Docker Compose)
- Install elixirs and conches from local directories
- Build Docker images
- Start and verify complete stack

**When to use**:
- Building complete GenAI healthcare applications
- Creating end-to-end prototypes
- Testing integration of elixirs and conches
- Rapid application development

**Example invocation**:
```
Create a complete DHTI application for glycemic control:

Elixir: Monitor glucose and HbA1c, provide recommendations
Conch: Display widget in patient chart with AI insights

Use start-dhti skill.
```

**Documentation**: [.github/skills/start-dhti/](../.github/skills/start-dhti/)

## Skill Workflow

### Individual Skills (elixir-generator, conch-generator)

```
User Request → AI Agent → Skill Instructions → Project Generation → Tests → Documentation
```

**Typical flow**:
1. User provides requirements to AI agent
2. AI agent reads skill instructions
3. Skill guides through:
   - Environment setup
   - Project scaffolding
   - Code implementation
   - Testing
   - Documentation
4. Output: Complete, tested, documented project

### Orchestration Skill (start-dhti)

```
User Request → AI Agent → start-dhti Skill →
  ├─ Invoke elixir-generator → Generated Elixir
  ├─ Invoke conch-generator → Generated Conch
  ├─ Setup infrastructure → Docker Compose
  ├─ Install from local dirs → Configured DHTI
  ├─ Build Docker images → Container Images
  └─ Start & verify → Running Application
```

**Typical flow**:
1. User provides complete app requirements
2. AI agent uses start-dhti skill
3. start-dhti orchestrates:
   - Elixir generation (via elixir-generator)
   - Conch generation (via conch-generator)
   - Infrastructure setup (Docker Compose)
   - Local directory installation (new `-l` flag)
   - Docker image building
   - Service startup and verification
4. Output: Running DHTI application

## Integration with Local Directory Installation

The skills are designed to work seamlessly with the new local directory installation feature:

### Traditional Workflow (Git-based)

```
1. Generate Project
2. Create Git Repository
3. Push to GitHub
4. Install from Git URL
```

**Limitations**:
- Requires Git repository
- Needs to push before testing
- Not suitable for rapid iteration

### New Workflow (Local Directory)

```
1. Generate Project (in local directory)
2. Install from Local Directory (using -l flag)
3. Test Immediately
4. Iterate Rapidly
```

**Benefits**:
- No Git repository required
- Immediate testing
- Rapid iteration
- Private/sensitive projects

## Using Skills with AI Agents

### GitHub Copilot

Skills are automatically discovered from `.github/skills/` directory.

**Example chat**:
```
@workspace I need to create a diabetes monitoring application.
Use the start-dhti skill to generate both backend and frontend.

Backend should query glucose levels from FHIR.
Frontend should display trends in patient chart.
```

### Claude

Skills are read from `.claude/skills/` directory.

**Example prompt**:
```
I need help creating a DHTI application. Please use the start-dhti 
skill to create a complete glycemic control monitoring system.

Requirements:
- Backend (elixir): Query FHIR for glucose and HbA1c
- Frontend (conch): Display in patient chart conditions tab
- Show trends and AI recommendations
```

### Other AI Tools

Skills are documented in markdown and can be:
- Copy-pasted into prompts
- Included via file references
- Linked in conversation context

## Skill Development

### Creating New Skills

1. **Create Directory Structure**:
   ```bash
   mkdir -p .github/skills/my-skill/examples
   mkdir -p .claude/skills/my-skill/examples
   ```

2. **Create SKILL.md**:
   - Define the skill purpose
   - Provide step-by-step instructions
   - Include success criteria
   - Document expected output

3. **Create README.md**:
   - Explain what the skill does
   - Provide usage examples
   - Document prerequisites
   - Include troubleshooting

4. **Create Examples**:
   - Provide sample requests
   - Show expected workflows
   - Include edge cases

5. **Test the Skill**:
   - Use with AI agents
   - Verify output quality
   - Iterate based on results

### Skill Best Practices

**Be Specific**: Provide clear, step-by-step instructions
```markdown
✓ "Run `uv run pytest` to execute tests"
✗ "Test your code"
```

**Include Context**: Provide domain knowledge
```markdown
✓ "FHIR Observation resources use LOINC codes for lab results"
✗ "Query observations"
```

**Validate Output**: Define success criteria
```markdown
✓ "All tests should pass (✓ 10 passing)"
✗ "Make sure tests work"
```

**Show Examples**: Provide concrete examples
```markdown
✓ "Example LOINC code for glucose: 2339-0"
✗ "Use appropriate LOINC codes"
```

**Handle Errors**: Include troubleshooting
```markdown
✓ "If import fails, check pyproject.toml path"
✗ "Fix any errors"
```

## Skill Composition

Skills can invoke other skills for complex workflows:

### Example: start-dhti Composition

```markdown
### Phase 2: Generate Elixir

Invoke the elixir-generator skill with the following requirements:
[Pass elixir requirements to elixir-generator]

### Phase 3: Generate Conch

Invoke the conch-generator skill with the following requirements:
[Pass conch requirements to conch-generator]
```

This enables:
- Modular skill development
- Reusable components
- Complex orchestrations
- Separation of concerns

## Common Patterns

### Pattern 1: Generation Skill

Generates a new project from templates:
- Setup environment
- Scaffold project (cookiecutter, degit, etc.)
- Implement requirements
- Test
- Document

**Examples**: elixir-generator, conch-generator

### Pattern 2: Configuration Skill

Configures existing infrastructure:
- Read current state
- Apply changes
- Validate configuration
- Provide rollback

**Example**: Compose configuration (could be a skill)

### Pattern 3: Orchestration Skill

Coordinates multiple skills:
- Parse complex requirements
- Invoke sub-skills
- Integrate outputs
- Verify end-to-end

**Examples**: start-dhti

### Pattern 4: Analysis Skill

Analyzes code or configuration:
- Read codebase
- Identify patterns
- Suggest improvements
- Generate reports

**Example**: Code review skill (potential future skill)

## Troubleshooting Skills

### Skill Not Found

**Symptoms**:
- AI agent doesn't recognize skill
- Instructions not followed

**Solutions**:
- Verify skill files exist in `.github/skills/` or `.claude/skills/`
- Check SKILL.md format is correct
- Try referencing skill explicitly in prompt
- Copy-paste skill content directly

### Skill Produces Wrong Output

**Symptoms**:
- Generated code doesn't work
- Wrong structure or format
- Missing components

**Solutions**:
- Review skill instructions for clarity
- Check examples match requirements
- Verify AI agent has necessary context
- Update skill with clearer instructions
- Add validation steps to skill

### Skill Fails Midway

**Symptoms**:
- Skill execution stops
- Incomplete output
- Error messages

**Solutions**:
- Check prerequisites are met
- Verify network connectivity
- Ensure tools are installed (uv, npm, docker)
- Review error logs
- Break skill into smaller steps

## Real-World Examples

### Example 1: Simple Elixir

**User Request**:
```
Create an elixir that queries patient demographics and returns a summary.
Name: dhti-elixir-patient-summary
```

**AI Agent**:
1. Reads elixir-generator skill
2. Runs cookiecutter
3. Implements chain.py:
   - FHIR Patient resource query
   - Data formatting
   - Summary generation
4. Implements bootstrap.py
5. Writes tests
6. Updates README

**Output**: Working elixir in `./dhti-elixir-patient-summary/`

### Example 2: Complete Application

**User Request**:
```
Build a medication interaction checker:

Backend: Check for drug interactions using FHIR MedicationRequest
Frontend: Alert widget in patient chart
```

**AI Agent**:
1. Uses start-dhti skill
2. Generates elixir:
   - Query MedicationRequest resources
   - Check interactions using knowledge base
   - Return alerts
3. Generates conch:
   - Display in patient chart
   - Show interaction warnings
   - Provide recommendations
4. Sets up infrastructure
5. Installs both from local directories
6. Starts DHTI server

**Output**: Running application at http://localhost/openmrs/spa/

## Performance Considerations

Skills can be complex and time-consuming:

| Skill | Typical Duration |
|-------|------------------|
| elixir-generator | 5-15 minutes |
| conch-generator | 5-15 minutes |
| start-dhti | 20-50 minutes |

Factors affecting performance:
- Complexity of requirements
- AI agent speed
- Network connectivity (cookiecutter, npm install)
- Docker build times
- Service startup times

## Future Directions

Potential new skills:

1. **dhti-test**: Comprehensive testing skill
2. **dhti-deploy**: Deployment orchestration
3. **dhti-migrate**: Migration between versions
4. **dhti-optimize**: Performance optimization
5. **dhti-security**: Security audit and fixes
6. **dhti-document**: Documentation generation

## Related Documentation

- [Local Directory Installation](./local-directory-installation.md)
- [CLI Options](./cli-options.md)
- [Development Guide](./development.md)
- [Main README](../README.md)

## Contributing

To contribute skills:

1. Create skill in both `.github/skills/` and `.claude/skills/`
2. Follow existing skill structure
3. Include comprehensive examples
4. Test with multiple AI agents
5. Document edge cases and troubleshooting
6. Submit pull request

## Support

For help with skills:
- [DHTI Documentation](https://dermatologist.github.io/dhti/)
- [DHTI Wiki](https://github.com/dermatologist/dhti/wiki)
- [GitHub Issues](https://github.com/dermatologist/dhti/issues)
- [Community Discussions](https://github.com/dermatologist/dhti/discussions)
