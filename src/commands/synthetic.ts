import {Args, Command, Flags} from '@oclif/core'
import fs from 'node:fs'
import bootstrap from '../utils/bootstrap.js'
import { ChainService } from '../utils/chain.js'
export default class Synthetic extends Command {
  static override args = {
    prompt: Args.string({description: 'Prompt file to read'}),
    output: Args.string({description: 'Output file to write'}),
  }

  static override description = 'Generate synthetic data using LLM'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    maxCycles: Flags.integer({char: 'm', description: 'Maximum number of cycles to run', default: 10}),
    maxRecords: Flags.integer({char: 'r', description: 'Maximum number of records to generate', default: 100}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Synthetic)
    const prompt = fs.readFileSync(args.prompt ?? '', 'utf8')
    const container = await bootstrap()
    const chain = new ChainService(container)

    const input = {
      question: prompt,
    }

    let responses: any[] = []
    for (let i = 0; i < flags.maxCycles; i++) {
      let response = await chain.Chain(input)
      let cycle = []
      const jsonArrayMatch = response.match(/\[[^\]]*\]/);
      if (jsonArrayMatch) {
        try {
          cycle = JSON.parse(jsonArrayMatch[0]);
        } catch (error) {
          console.error('Failed to parse JSON array from response:', error);
        }
      }
      responses = responses.concat(cycle)
      console.log(`Iteration ${i + 1}: Collected ${responses.length} titles so far, ${flags.maxRecords - responses.length} to go`);
      if (responses.length >= flags.maxRecords) break;
    }
    const csvContent = responses.join('\n');
    fs.writeFileSync(args.output ?? '', csvContent);
     console.log(`${args.output} has been created with ${flags.maxRecords} records`);
  }
}
