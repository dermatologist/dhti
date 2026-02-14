
**🤖 AI-Powered Workflow with GitHub Copilot SDK:**

DHTI now integrates with GitHub Copilot SDK, enabling AI-assisted workflows directly from the command line with **stateful conversations**:

```bash

# Use specific skills for specialized tasks
npx dhti-cli copilot --prompt "Create a patient risk assessment elixir" --skill elixir-generator

# Load prompts from files for complex workflows
npx dhti-cli copilot --file ./my-workflow.txt --model gpt-4.1

# Clear conversation history and start fresh
npx dhti-cli copilot --clear-history --prompt "Start a new conversation"

# Or just clear history without starting a new conversation
npx dhti-cli copilot --clear-history

# Interactive AI assistance with auto-skill detection
npx dhti-cli copilot --prompt "Start the DHTI stack with langserve and ollama"

# Available skills: start-dhti, elixir-generator, conch-generator, or auto (default)
```

Prerequisites for Copilot SDK:
- Install GitHub Copilot CLI: https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line
- Authenticate: `copilot auth login`
- See detailed guide: [notes/copilot-sdk-dhti.md](/notes/copilot-sdk-dhti.md)
