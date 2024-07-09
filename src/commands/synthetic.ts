import {Args, Command, Flags} from '@oclif/core'
import fs from 'node:fs'
import bootstrap from '../utils/bootstrap.js'
import { ChainService } from '../utils/chain.js'
export default class Synthetic extends Command {
	static override args = {
		prompt: Args.string({description: 'Prompt file to read'}),
		output: Args.string({description: 'Output file to write'}),
		input: Args.string({description: 'Input file to process'}), // object with input, instruction (rationale in distillation), output
	}

	static override description = 'Generate synthetic data using LLM'

	static override examples = [
		'<%= config.bin %> <%= command.id %>',
	]

	static override flags = {
		maxCycles: Flags.integer({char: 'm', description: 'Maximum number of cycles to run', default: 0}),
		maxRecords: Flags.integer({char: 'r', description: 'Maximum number of records to generate', default: 10}),
		inputField: Flags.string({char: 'i', description: 'Input field to use', default: 'input', options: ['input', 'instruction', 'output']}),
		outputField: Flags.string({char: 'o', description: 'Output field to use', default: 'output', options: ['input', 'instruction', 'output']}),
	}

	public async run(): Promise<void> {
		const {args, flags} = await this.parse(Synthetic)
		const prompt = fs.readFileSync(args.prompt ?? '', 'utf8')
		const container = await bootstrap()
		const chain = new ChainService(container)

		if (flags.maxCycles){
			const input = {
				input: prompt,
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
				console.log(`Iteration ${i + 1}: Collected ${responses.length} records so far, ${flags.maxRecords - responses.length} to go`);
				if (responses.length >= flags.maxRecords) break;
			}
			// convert to json
			let jsonOutput = []
			for(let i = 0; i < responses.length; i++){
				jsonOutput.push({
					[flags.outputField]: responses[i],
				})
			}

			fs.writeFileSync(args.output ?? '', JSON.stringify(jsonOutput, null, 4));
			console.log(`${args.output} has been created with ${flags.maxRecords} records`);
		}
	}
}
