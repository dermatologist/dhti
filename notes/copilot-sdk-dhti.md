# GitHub Copilot SDK Integration with DHTI

This guide provides comprehensive instructions for using the GitHub Copilot SDK with DHTI to create AI-powered healthcare workflows.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Command Reference](#command-reference)
- [Skills System](#skills-system)
- [Usage Examples](#usage-examples)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Overview

The DHTI Copilot command integrates GitHub's Copilot SDK to provide AI-assisted development workflows for GenAI healthcare applications. It combines the power of large language models with DHTI's skill system to:

- **Automate complex workflows**: Start entire DHTI stacks, generate elixirs and conches with natural language prompts
- **Context-aware assistance**: Automatically detect the right skill based on your prompt
- **Streaming responses**: Real-time feedback as the AI processes your request
- **Skill-based guidance**: Leverage documented DHTI skills (start-dhti, elixir-generator, conch-generator) for consistent, high-quality results
- **Stateful conversations**: Maintain conversation history across multiple command executions for continuous dialogue

## Prerequisites

### Required Software

1. **GitHub Copilot CLI**
   ```bash
   # Install via npm (recommended)
   npm install -g @githubnext/github-copilot-cli
   
   # Or follow the official installation guide:
   # https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line
   ```

2. **GitHub Copilot Subscription**
   - A GitHub Copilot subscription is required unless using BYOK (Bring Your Own Key)
   - Free tier available with limited usage
   - See: https://github.com/features/copilot#pricing

3. **DHTI CLI** (you already have this if you're reading this!)
   ```bash
   npm install -g dhti-cli
   ```

### Authentication

Authenticate with GitHub Copilot:

```bash
copilot auth login
```

Verify it's working:

```bash
copilot --version
```

### Optional: BYOK (Bring Your Own Key)

If you prefer to use your own API keys from OpenAI, Azure AI Foundry, or Anthropic:

1. See the [BYOK documentation](https://github.com/github/copilot-sdk/blob/main/docs/auth/byok.md)
2. Configure your API keys as environment variables
3. The SDK will automatically use your keys instead of GitHub authentication

## Getting Started

### Quick Start

1. **Simple prompt:**
   ```bash
   dhti-cli copilot --prompt "Help me understand the DHTI architecture"
   ```

2. **Start the full DHTI stack:**
   ```bash
   dhti-cli copilot --prompt "Start the DHTI stack with langserve and ollama"
   ```

3. **Generate a new elixir:**
   ```bash
   dhti-cli copilot --prompt "Create an elixir for patient risk assessment using FHIR data"
   ```

## Command Reference

### Basic Syntax

```bash
dhti-cli copilot [OPTIONS]
```

### Flags

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--prompt` | `-p` | Prompt to send to Copilot SDK | - |
| `--file` | `-f` | Path to file containing prompt | - |
| `--model` | `-m` | Model to use (e.g., gpt-4.1, gpt-4o, gpt-5.2) | `gpt-4.1` |
| `--skill` | `-s` | Skill to use (auto, start-dhti, elixir-generator, conch-generator) | `auto` |
| `--clear-history` | - | Clear conversation history and optionally start fresh | `false` |

**Note**: Either `--prompt` or `--file` must be provided, but not both (unless only using `--clear-history`).

### Model Selection

Available models depend on your GitHub Copilot subscription. Common options:

- `gpt-4.1` (default) - GPT-4 Turbo with enhanced reasoning
- `gpt-4o` - GPT-4 Omni with multimodal capabilities
- `gpt-5.2` - Latest GPT-5 model (if available in your subscription)

Check available models:
```bash
copilot --list-models
```

## Skills System

DHTI uses a skill-based system to provide context-specific guidance to the AI. Skills are markdown files located in `.agents/skills/` that contain detailed instructions for specific workflows.

### Available Skills

1. **start-dhti** (Default)
   - Orchestrates the complete DHTI development workflow
   - Installs elixirs and conches
   - Starts fully functional DHTI server with Docker
   - Use for: General setup, full stack deployment

2. **elixir-generator**
   - Generates new DHTI elixir projects (GenAI backends)
   - LangServe-based HTTP endpoints
   - FHIR integration with base class support
   - Use for: Creating new GenAI backends, patient data processing

3. **conch-generator**
   - Generates OpenMRS ESM UI components (frontends)
   - React-based microfrontends
   - OpenMRS 3.x integration
   - Use for: Creating new UI components, patient-facing interfaces

### Skill Auto-Detection

When you use `--skill auto` (the default), the command analyzes your prompt and automatically selects the most appropriate skill:

**Triggers elixir-generator:**
- Keywords: "elixir", "backend", "langserve", "genai app"

**Triggers conch-generator:**
- Keywords: "conch", "frontend", "ui", "openmrs"

**Triggers start-dhti:**
- Default for general queries, setup tasks, or orchestration

### Skill Loading

Skills are loaded in this order:

1. **Local skills**: First checks `.agents/skills/<skill-name>/SKILL.md`
2. **Remote skills**: If not found locally, fetches from GitHub:
   - URL: `https://raw.githubusercontent.com/dermatologist/dhti/develop/.agents/skills/<skill-name>/SKILL.md`

This allows the command to work even if you don't have the latest skills locally.

## Usage Examples

### Example 1: Basic Query

Ask a simple question about DHTI:

```bash
dhti-cli copilot --prompt "What is DHTI and how does it work?"
```

**Expected output:**
```
Initializing GitHub Copilot SDK...
Using model: gpt-4.1
Using skill: start-dhti

--- Copilot Response ---

DHTI (Dhanvantari Healthcare Technology Integration) is a CLI tool and framework 
for rapid prototyping of GenAI healthcare applications...

--- End of Response ---
```

### Example 2: Generate an Elixir

Create a new GenAI backend for clinical decision support:

```bash
dhti-cli copilot --prompt "Create an elixir that checks drug-drug interactions using FHIR MedicationRequest resources"
```

**What happens:**
1. Auto-detects `elixir-generator` skill
2. Loads skill instructions
3. Guides you through elixir generation process
4. Provides code examples and next steps

### Example 3: Generate a Conch

Create a new OpenMRS UI component:

```bash
dhti-cli copilot --prompt "Create a patient vitals display conch for OpenMRS"
```

**What happens:**
1. Auto-detects `conch-generator` skill
2. Loads conch generation instructions
3. Provides React component scaffold
4. Shows integration steps with OpenMRS

### Example 4: Complex Workflow from File

For complex multi-step workflows, save your prompt in a file:

**workflow.txt:**
```
I need to create a complete patient risk assessment system with:
1. An elixir that analyzes patient data using FHIR API
2. A conch that displays risk scores in OpenMRS
3. Deploy everything to the DHTI stack with Docker

Please guide me through each step.
```

**Execute:**
```bash
dhti-cli copilot --file workflow.txt --model gpt-4o
```

### Example 5: Explicit Skill Selection

Force a specific skill for specialized guidance:

```bash
dhti-cli copilot --skill elixir-generator --prompt "How do I add RAG capabilities to my elixir?"
```

### Example 6: Different Models

Try different models for varied responses:

```bash
# Using GPT-4 Omni for enhanced reasoning
dhti-cli copilot -m gpt-4o --prompt "Compare different approaches for implementing clinical alerts"

# Using GPT-5 (if available)
dhti-cli copilot -m gpt-5.2 --prompt "Design a DHTI architecture for multi-tenant deployment"
```

### Example 7: Stateful Conversations

Maintain context across multiple interactions:

```bash
# First interaction - start the conversation
dhti-cli copilot --prompt "I need to set up a DHTI development environment"

# AI responds with setup steps...

# Continue the conversation - history is automatically maintained
dhti-cli copilot --prompt "Now add ollama for local model hosting"

# AI remembers the previous context and continues naturally...

# Ask a follow-up question
dhti-cli copilot --prompt "What configuration changes do I need for production?"

# AI continues with the full context of the conversation...

# Start fresh when needed
dhti-cli copilot --clear-history --prompt "Let's discuss a different topic"
```

**What happens:**
1. Each command execution saves the conversation (user prompt + AI response) to `~/.dhti/copilot-history.json`
2. Subsequent commands load the history and include it in the system message
3. The AI maintains context across multiple command executions
4. Use `--clear-history` to reset and start a new conversation

### Example 8: Managing Conversation History

```bash
# Check if you have history by looking at the message count
dhti-cli copilot --prompt "Continue our discussion"
# Output: 📜 Loaded 4 previous message(s) from history

# Clear history without starting a new conversation
dhti-cli copilot --clear-history
# Output: ✓ Conversation history cleared

# Clear history and immediately start a new conversation
dhti-cli copilot --clear-history --prompt "Let's start over with a new project"
```

## Advanced Features

### Streaming Responses

All responses are streamed in real-time, providing immediate feedback as the AI generates content. You'll see text appear progressively rather than waiting for the complete response.

### Stateful Conversation History

The copilot command maintains conversation history across multiple executions, enabling continuous dialogue:

**How it works:**
- Conversation history is stored in `~/.dhti/copilot-history.json`
- Each interaction (user prompt + AI response) is appended to the history
- History is loaded automatically on subsequent commands
- History is included in the system message for context

**Benefits:**
- **Continuity**: AI remembers previous interactions and maintains context
- **Efficiency**: No need to repeat context in every prompt
- **Natural dialogue**: Conversations flow naturally across multiple command executions
- **Iterative refinement**: Easily build on previous responses

**Management:**
- View history status: Each command shows how many messages are loaded
- Clear history: Use `--clear-history` flag to start fresh
- Storage location: `~/.dhti/copilot-history.json` (simple JSON format)
- No size limits: History grows indefinitely until cleared

**Best practices:**
1. Clear history when switching to a completely different topic
2. Clear history if responses become confused or lose focus
3. Keep conversations focused on related topics for best results
4. Periodically clear history to prevent overly long context

### Error Handling

The command includes comprehensive error handling:

- **Missing Copilot CLI**: Clear instructions to install and authenticate
- **Skill loading failures**: Falls back gracefully, continues without skill context
- **File not found**: Validates file existence before processing
- **Network issues**: Handles GitHub API failures when fetching remote skills
- **History errors**: Warns about history read/write failures without blocking execution

### System Message Configuration

Skills are injected into the AI's system message using the "append" mode, which:
- Preserves GitHub Copilot SDK's built-in safety guardrails
- Adds DHTI-specific instructions on top
- Includes conversation history for context
- Ensures consistent, high-quality responses

## Troubleshooting

### Issue: "Failed to interact with Copilot SDK"

**Cause**: Copilot CLI not installed or not authenticated

**Solution**:
```bash
# 1. Install Copilot CLI
npm install -g @githubnext/github-copilot-cli

# 2. Authenticate
copilot auth login

# 3. Verify
copilot --version
```

### Issue: "Skill not found locally, fetching from GitHub..."

**Cause**: Local skills directory is missing or outdated

**Solution**: This is normal behavior. The command will fetch the latest skills from GitHub automatically. To cache skills locally:

```bash
# Clone the DHTI repository
git clone https://github.com/dermatologist/dhti.git

# Navigate to your project and create symlink to skills
ln -s /path/to/dhti/.agents .agents
```

### Issue: Slow response times

**Cause**: Network latency or model load

**Solutions**:
- Use a faster model like `gpt-4.1` instead of `gpt-5.2`
- Check your internet connection
- Try during off-peak hours

### Issue: Response doesn't match expected output

**Cause**: Wrong skill selected or unclear prompt

**Solutions**:
- Use `--skill` to explicitly specify the skill
- Rephrase your prompt to be more specific
- Include context and examples in your prompt

### Issue: Conversation history causing confused responses

**Cause**: Long or mixed-topic conversation history

**Solutions**:
```bash
# Clear history and start fresh
dhti-cli copilot --clear-history

# Then start your new conversation
dhti-cli copilot --prompt "New topic here"
```

### Issue: Unable to read/write conversation history

**Cause**: File permission issues or disk space

**Solutions**:
- Check permissions on `~/.dhti/` directory
- Ensure sufficient disk space
- Manually delete `~/.dhti/copilot-history.json` if corrupted
- The command will continue to work even if history can't be saved

## Future Improvements

### Planned Enhancements

1. **Custom Tools Integration**
   - Add DHTI-specific tools (file operations, Docker commands, FHIR queries)
   - Enable Copilot to directly execute DHTI CLI commands
   - Implement tool approval workflow for safety

2. **Enhanced Session Management** ✅ *Implemented*
   - ✅ Save conversation history for multi-turn interactions
   - ✅ Clear history with `--clear-history` flag
   - Future: Export conversations to markdown for documentation
   - Future: Import/restore conversation sessions

3. **Advanced Parameters**
   - Add `--temperature` flag for response randomness control
   - Add `--max-tokens` flag for response length control
   - Support for reasoning effort configuration

4. **Skill Marketplace**
   - Community-contributed skills
   - Skill versioning and updates
   - Skill discovery via `dhti-cli skill search`

5. **Interactive Mode**
   - REPL-style interface for continuous conversation
   - Multi-turn debugging and refinement
   - Context-aware follow-up questions

6. **Enhanced Auto-Detection**
   - Machine learning-based skill selection
   - Multi-skill workflows (combine elixir + conch generation)
   - Confidence scores for skill matching

7. **Integration Features**
   - Direct integration with DHTI compose commands
   - Automatic code generation and file creation
   - One-command deployment from AI guidance

8. **Monitoring and Analytics**
   - Track AI assistance usage
   - Measure time saved vs manual workflows
   - Identify common patterns for skill optimization

### Contributing

We welcome contributions! If you have ideas for improvements:

1. Open an issue: https://github.com/dermatologist/dhti/issues
2. Submit a PR with your enhancement
3. Share your custom skills with the community

## Additional Resources

- **GitHub Copilot SDK Docs**: https://github.com/github/copilot-sdk
- **DHTI Repository**: https://github.com/dermatologist/dhti
- **DHTI Wiki**: https://github.com/dermatologist/dhti/wiki
- **Skills Directory**: https://github.com/dermatologist/dhti/tree/develop/.agents/skills
- **Example Elixirs**: https://github.com/dermatologist/dhti-elixir
- **Example Conches**: https://github.com/dermatologist/openmrs-esm-dhti

## Feedback

Your feedback helps improve DHTI! Please:

- Report issues: https://github.com/dermatologist/dhti/issues
- Share success stories in Discussions
- Contribute documentation improvements
- Suggest new features

---

**Note**: This feature is part of DHTI's ongoing effort to democratize GenAI healthcare development. The copilot command makes it easier for clinicians, developers, and researchers to build, test, and deploy healthcare AI applications without deep technical expertise.
