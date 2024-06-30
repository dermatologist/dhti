import {Args, Command, Flags} from '@oclif/core'

import fs from 'fs'

export default class Compose extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (add or delete)'}),
  }

  static override description = 'Generates a docker-compose.yml file from a list of modules'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    // flag with a value (-n, --name=VALUE)
    module: Flags.string({char: 'm', multiple: true, description: 'Modules to add from ( default, gateway, langserve, openmrs, ollama, langfuse, fhir, redis, cql and neo4j)'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Compose)

    // console.log('args', args) //args { op: 'add' }
    // console.log('flags', flags) //flags { module: [ 'default', 'langserve', 'redis' ] }

    try {
      const data = fs.readFileSync('docker-compose.yml', 'utf8');
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  }
}
