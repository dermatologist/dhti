import {Args, Command, Flags} from '@oclif/core'

import fs from 'fs'
import yaml from 'js-yaml'

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
    module: Flags.string({char: 'm', multiple: true, description: 'Modules to add from ( langserve, openmrs, ollama, langfuse, cql_fhir, redis and neo4j)'}),
    file: Flags.string({char: 'f', description: 'Docker compose file to read from. Creates if it does not exist', default: 'docker-compose.yml'}),

  }


  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Compose)

    // console.log('args', args) //args { op: 'add' }
    // console.log('flags', flags) //flags { module: [ 'default', 'langserve', 'redis' ] }

    const openmrs = ['gateway', 'frontend', 'backend', 'db']
    const langserve = ['langserve']
    const ollama = ['ollama', 'ollama-webui']
    const langfuse = ['langfuse', 'langfuse-db']
    const cql_fhir = ['fhir', 'cql-elm', 'cql-web']
    const redis = ['redis']
    const neo4j = ['neo4j']


    const _modules = {
      openmrs: openmrs,
      langserve: langserve,
      ollama: ollama,
      langfuse: langfuse,
      cql_fhir: cql_fhir,
      redis: redis,
      neo4j: neo4j
    }

    try {
      const data: any = yaml.load(fs.readFileSync(flags.file, 'utf8'));
      console.log(data);
      console.log('flags', flags.module);
      console.log('args', args.op);

      const devString : string = yaml.dump(data);
      fs.writeFileSync('docker-compose-dev.yml', devString, 'utf8');
    } catch (err) {
      console.error(err);
    }
  }
}
