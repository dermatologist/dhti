import {Args, Command, Flags} from '@oclif/core'
import fs from 'node:fs'

import bootstrap from '../utils/bootstrap.js'
import { ChainService } from '../utils/chain.js'
export default class Synthetic extends Command {
	static override args = {
		input: Args.string({default:"", description: 'Input file to process'}), // object with input, instruction (rationale in distillation), output
		output: Args.string({description: 'Output file to write'}),
		prompt: Args.string({default:"", description: 'Prompt file to read'}),
	}


	static override description = 'Generate synthetic data using LLM'

	static override examples = [
		'<%= config.bin %> <%= command.id %>',
	]

	static override flags = {
		inputField: Flags.string({char: 'i', default: 'input', description: 'Input field to use', options: ['input', 'instruction', 'output']}),
		maxCycles: Flags.integer({char: 'm', default: 0, description: 'Maximum number of cycles to run'}),
		maxRecords: Flags.integer({char: 'r', default: 10, description: 'Maximum number of records to generate'}),
		outputField: Flags.string({char: 'o', default: 'output', description: 'Output field to use', options: ['input', 'instruction', 'output']}),
	}

	public async run(): Promise<void> {
		const {args, flags} = await this.parse(Synthetic)
		let prompt = ""
		// read prompt file if provided
		if (args.prompt)
			prompt = fs.readFileSync(args.prompt ?? '', 'utf8')
		const container = await bootstrap()
		const chain = new ChainService(container)

		// if no output file, exit with error
		if (!args.output) {
			console.log("Please provide an output file")
			this.exit(1)
		}

		if (flags.maxCycles){ // No input file, can process in batches
			const input = {
				input: prompt,
			}
			let responses: any[] = []
			for (let i = 0; i < flags.maxCycles; i++) {
				const response = await chain.Chain(input)
				let cycle = []
				const jsonArrayMatch = response.match(/\[[^\]]*]/);
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
			const jsonOutput = []
			for(const response of responses){
				jsonOutput.push({
					[flags.outputField]: response,
				})
			}

			fs.writeFileSync(args.output ?? '', JSON.stringify(jsonOutput, null, 4));
			console.log(`${args.output} has been created with ${flags.maxRecords} records`);
		}
		else { // Input file, process one by one
			// read input file
			const input = JSON.parse(fs.readFileSync(args.input ?? '', 'utf8'))
			const responses = []
			// for each record in input file
			for(const [i, record] of input.entries()){
				const chainInput = {
					input: record[flags.inputField],
					prompt,
				}
				const response = await chain.Chain(chainInput)
				record[flags.outputField] = response
				responses.push(record)
				if (responses.length >= flags.maxRecords) break;
				console.log(`Processed ${i + 1} records so far, ${flags.maxRecords - responses.length} to go`)
			}

			// write to output file
			fs.writeFileSync(args.output ?? '', JSON.stringify(responses, null, 4));
			console.log(`${args.output} has been created with ${responses.length} records`);
		}
	}
}
