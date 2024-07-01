import {Args, Command, Flags} from '@oclif/core'
import yaml from 'js-yaml'
import fs from 'node:fs'

export default class Compose extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (add or delete)'}),
  }

  static override description = 'Generates a docker-compose.yml file from a list of modules'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    file: Flags.string({char: 'f', default: '/tmp/docker-compose.yml', description: 'Full path to the docker compose file to read from. Creates if it does not exist'}),
    // flag with a value (-n, --name=VALUE)
    module: Flags.string({char: 'm', description: 'Modules to add from ( langserve, openmrs, ollama, langfuse, cql_fhir, redis and neo4j)', multiple: true}),
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


    const _modules: {[key: string]: string[]} = {
      cql_fhir,
      langfuse,
      langserve,
      neo4j,
      ollama,
      openmrs,
      redis
    }

    try {
      const master_data: any = yaml.load(fs.readFileSync('src/resources/docker-compose-master.yml', 'utf8'));
      let existing_data:any = {services: {}, version: '3.8'};
      if (fs.existsSync(flags.file)) {
        existing_data = yaml.load(fs.readFileSync(flags.file, 'utf8'));
      }

      // if existing data is not null and arg is delete, remove the modules from the existing data
      if (Object.keys(existing_data.services).length > 0 && args.op === 'delete') {
        // Expand the modules to remove using _modules object
        let modules_to_delete: any[] = [];
        for (const module of flags.module ?? []) {
          modules_to_delete = modules_to_delete.concat(_modules[module]);
        }

        for (const module of modules_to_delete ?? []) {
          if (existing_data.services[module]) {
            delete existing_data.services[module];
          }
        }
      }

      // if arg is add, add the modules from the master data
      if (args.op === 'add') {
        // Expand the modules to add using _modules object
        let modules_to_add: any[] = [];
        for (const module of flags.module ?? []) {
          modules_to_add = modules_to_add.concat(_modules[module]);
        }

        for (const module of modules_to_add ?? []) {
          existing_data.services[module] = master_data.services[module];
        }
      }

      // Add all volumes from master data to existing data by default
      existing_data.volumes = {};
      for (const key of Object.keys(master_data.volumes)) {
        existing_data.volumes[key] = master_data.volumes[key];
      }

      console.log('Writing file:', existing_data);

      fs.writeFileSync(flags.file, yaml.dump(existing_data), 'utf8');

    } catch (error) {
      console.error(error);
    }
  }
}
