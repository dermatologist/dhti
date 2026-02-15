import {CopilotClient} from '@github/copilot-sdk'
import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

/**
 * Copilot command that uses the GitHub Copilot SDK to interact with DHTI
 * and display results with streaming support.
 */
export default class Copilot extends Command {
  static override description = 'Interact with DHTI using GitHub Copilot SDK with streaming responses'

  static override examples = [
    '<%= config.bin %> <%= command.id %> --prompt "Start the DHTI stack with langserve"',
    '<%= config.bin %> <%= command.id %> --file ./my-prompt.txt --model gpt-4.1',
    '<%= config.bin %> <%= command.id %> --prompt "Generate a new elixir for patient risk assessment" --skill elixir-generator',
    '<%= config.bin %> <%= command.id %> --clear-history --prompt "Start fresh conversation"',
    '<%= config.bin %> <%= command.id %> --clear-history  # Clear history without starting new conversation',
  ]

  static override flags = {
    'clear-history': Flags.boolean({
      char: 'c',
      default: false,
      description: 'Clear conversation history and start a new session',
    }),
    file: Flags.string({
      char: 'f',
      description: 'Path to a file containing the prompt to send to copilot-sdk',
      exclusive: ['prompt'],
    }),
    model: Flags.string({
      char: 'm',
      default: 'gpt-4.1',
      description: 'Model to use for copilot-sdk interactions',
    }),
    prompt: Flags.string({
      char: 'p',
      description: 'Prompt to send to the copilot-sdk',
      exclusive: ['file'],
    }),
    skill: Flags.string({
      char: 's',
      default: 'auto',
      description: 'Skill to use for copilot-sdk interactions (auto, start-dhti, elixir-generator, conch-generator)',
    }),
  }

  /**
   * Detects the appropriate skill based on the prompt content
   * @param prompt - The user's prompt text
   * @returns The detected skill name
   */
  private detectSkill(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()

    // Check for elixir-related keywords
    if (
      lowerPrompt.includes('elixir') ||
      lowerPrompt.includes('backend') ||
      lowerPrompt.includes('langserve') ||
      lowerPrompt.includes('genai app')
    ) {
      return 'elixir-generator'
    }

    // Check for conch-related keywords
    if (
      lowerPrompt.includes('conch') ||
      lowerPrompt.includes('frontend') ||
      lowerPrompt.includes('ui') ||
      lowerPrompt.includes('openmrs')
    ) {
      return 'conch-generator'
    }

    // Use start-dhti if prompt includes 'start', 'show', or 'run'
    if (lowerPrompt.includes('start') || lowerPrompt.includes('show') || lowerPrompt.includes('run')) {
      return 'start-dhti'
    }

    // If none of the skills match, exit asking for a skill name and show available skills
    const availableSkills = ['start-dhti', 'elixir-generator', 'conch-generator']
    this.error(
      `Could not detect the appropriate skill from the prompt.\n` +
        `Please specify a skill name using --skill.\n` +
        `Available skills: ${availableSkills.join(', ')}`,
    )
    return ''
  }

  /**
   * Gets the path to the conversation history file
   * @returns The path to the history file
   */
  private getHistoryFilePath(): string {
    const dhtiDir = path.join(os.homedir(), '.dhti')
    if (!fs.existsSync(dhtiDir)) {
      fs.mkdirSync(dhtiDir, {recursive: true})
    }

    return path.join(dhtiDir, 'copilot-history.json')
  }

  /**
   * Loads conversation history from file
   * @returns Array of conversation turns or empty array if no history
   */
  private loadConversationHistory(): Array<{role: 'assistant' | 'user'; content: string}> {
    try {
      const historyPath = this.getHistoryFilePath()
      if (fs.existsSync(historyPath)) {
        const historyData = fs.readFileSync(historyPath, 'utf8')
        return JSON.parse(historyData)
      }
    } catch (error) {
      this.warn(chalk.yellow(`Failed to load conversation history: ${error}`))
    }

    return []
  }

  /**
   * Saves conversation history to file
   * @param history - Array of conversation turns to save
   */
  private saveConversationHistory(history: Array<{role: 'assistant' | 'user'; content: string}>): void {
    try {
      const historyPath = this.getHistoryFilePath()
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8')
    } catch (error) {
      this.warn(chalk.yellow(`Failed to save conversation history: ${error}`))
    }
  }

  /**
   * Clears the conversation history
   */
  private clearConversationHistory(): void {
    try {
      const historyPath = this.getHistoryFilePath()
      if (fs.existsSync(historyPath)) {
        fs.unlinkSync(historyPath)
        this.log(chalk.green('✓ Conversation history cleared'))
      } else {
        this.log(chalk.yellow('No conversation history to clear'))
      }
    } catch (error) {
      this.warn(chalk.yellow(`Failed to clear conversation history: ${error}`))
    }
  }

  /**
   * Fetches skill content from GitHub if not available locally
   * @param skillName - The name of the skill to fetch
   * @returns The skill content or null if not found
   */
  private async fetchSkillFromGitHub(skillName: string): Promise<null | string> {
    try {
      const url = `https://raw.githubusercontent.com/dermatologist/dhti/develop/.agents/skills/${skillName}/SKILL.md`
      const response = await fetch(url)

      if (!response.ok) {
        return null
      }

      return response.text()
    } catch (error) {
      this.warn(`Failed to fetch skill ${skillName} from GitHub: ${error}`)
      return null
    }
  }

  /**
   * Loads skill instructions from local or remote source
   * @param skillName - The name of the skill to load
   * @returns The skill content or null if not found
   */
  private async loadSkill(skillName: string): Promise<null | string> {
    // Resolve skills directory
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const skillsDir = path.resolve(__dirname, '../../.agents/skills')
    const skillPath = path.join(skillsDir, skillName, 'SKILL.md')

    // Try to load from local directory first
    if (fs.existsSync(skillPath)) {
      try {
        return fs.readFileSync(skillPath, 'utf8')
      } catch (error) {
        this.warn(`Failed to read local skill file: ${error}`)
      }
    }

    // If not found locally, try to fetch from GitHub
    this.log(chalk.yellow(`Skill ${skillName} not found locally, fetching from GitHub...`))
    return this.fetchSkillFromGitHub(skillName)
  }

  // eslint-disable-next-line perfectionist/sort-classes
  public async run(): Promise<void> {
    const {flags} = await this.parse(Copilot)

    // Handle clear-history flag
    if (flags['clear-history']) {
      this.clearConversationHistory()
      // If only clearing history, exit after clearing
      if (!flags.prompt && !flags.file) {
        return
      }
    }

    // Validate that either prompt or file is provided
    if (!flags.prompt && !flags.file) {
      this.error('Either --prompt or --file must be provided')
    }

    // Get the prompt content
    let promptContent: string
    if (flags.file) {
      if (!fs.existsSync(flags.file)) {
        this.error(`File not found: ${flags.file}`)
      }

      try {
        promptContent = fs.readFileSync(flags.file, 'utf8')
      } catch (error) {
        this.error(`Failed to read file: ${error}`)
      }
    } else {
      promptContent = flags.prompt!
    }

    // Load conversation history
    const conversationHistory = this.loadConversationHistory()
    const hasHistory = conversationHistory.length > 0

    if (hasHistory) {
      this.log(chalk.cyan(`📜 Loaded ${conversationHistory.length} previous message(s) from history`))
    }

    // Determine which skill to use
    let skillName = flags.skill
    if (skillName === 'auto') {
      skillName = this.detectSkill(promptContent)
      this.log(chalk.cyan(`Auto-detected skill: ${skillName}`))
    }

    // Load the skill instructions
    const skillContent = await this.loadSkill(skillName)
    if (!skillContent) {
      this.warn(chalk.yellow(`Could not load skill: ${skillName}. Proceeding without skill context.`))
    }

    // Build system message with skill instructions
    let systemMessageContent =
      'You are a helpful assistant that can use specific skills to generate components of the DHTI stack based on user prompts.'

    // Add skill-specific instructions
    if (skillContent) {
      systemMessageContent += '\n\n' + skillContent
    }

    // Add default instruction to use start-dhti skill
    if (skillName !== 'start-dhti') {
      systemMessageContent += '\n\nNote: If the user needs to start the DHTI stack, use the start-dhti skill workflow.'
    }

    // Add conversation history context
    if (hasHistory) {
      systemMessageContent += '\n\n## Previous Conversation\n'
      systemMessageContent += 'Here is the conversation history for context:\n\n'
      for (const turn of conversationHistory) {
        systemMessageContent += `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}\n\n`
      }

      systemMessageContent += 'Continue the conversation naturally based on this context.'
    }

    this.log(chalk.green('Initializing GitHub Copilot SDK...'))

    let client: CopilotClient | null = null
    let assistantResponse = ''

    try {
      // Create copilot client
      client = new CopilotClient()

      // Create a session with streaming enabled
      const session = await client.createSession({
        model: flags.model,
        streaming: true,
        systemMessage: {
          content: systemMessageContent,
          mode: 'append',
        },
      })

      this.log(chalk.green(`Using model: ${flags.model}`))
      this.log(chalk.green(`Using skill: ${skillName}`))
      this.log(chalk.blue('\n--- Copilot Response ---\n'))

      // Handle streaming responses
      let responseStarted = false
      session.on('assistant.message_delta', (event) => {
        if (!responseStarted) {
          responseStarted = true
        }

        const content = event.data.deltaContent
        process.stdout.write(content)
        assistantResponse += content
      })

      // Handle session idle (response complete)
      session.on('session.idle', () => {
        if (responseStarted) {
          console.log('\n') // Add newline after response
        }
      })

      // Send the prompt and wait for completion
      await session.sendAndWait({prompt: promptContent})

      this.log(chalk.blue('\n--- End of Response ---\n'))

      // Save conversation history
      conversationHistory.push({content: promptContent, role: 'user'})
      if (assistantResponse.trim()) {
        conversationHistory.push({content: assistantResponse.trim(), role: 'assistant'})
      }

      this.saveConversationHistory(conversationHistory)
      this.log(
        chalk.dim(`💾 Conversation saved (${conversationHistory.length} messages). Use --clear-history to reset.`),
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.error(
        chalk.red(`Failed to interact with Copilot SDK: ${errorMessage}\n\n`) +
          chalk.yellow('Troubleshooting:\n') +
          chalk.yellow(
            '1. Ensure GitHub Copilot CLI is installed: https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line\n',
          ) +
          chalk.yellow('2. Authenticate with: copilot auth login\n') +
          chalk.yellow('3. Verify CLI is working: copilot --version\n'),
      )
    } finally {
      // Clean up
      if (client) {
        await client.stop()
      }
    }
  }
}
