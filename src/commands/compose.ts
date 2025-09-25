import {Args, Command, Flags} from '@oclif/core'
import yaml from 'js-yaml'
import fs from 'node:fs'
import os from 'node:os'

export default class Compose extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (add, delete, read or reset)'}),
  }

  static override description = 'Generates a docker-compose.yml file from a list of modules'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    file: Flags.string({char: 'f', default: `${os.homedir()}/dhti/docker-compose.yml`, description: 'Full path to the docker compose file to read from. Creates if it does not exist'}),
    // flag with a value (-n, --name=VALUE)
    module: Flags.string({char: 'm', description: 'Modules to add from ( langserve, openmrs, ollama, langfuse, cqlFhir, redis, neo4j and mcpFhir)', multiple: true}),
  }

  public static init = () => {
    // Create ${os.homedir()}/dhti if it does not exist
    if (!fs.existsSync(`${os.homedir()}/dhti`)) {
      fs.mkdirSync(`${os.homedir()}/dhti`);
    }

    // Create ${os.homedir()}/dhti/docker-compose.yml if it does not exist
    if (!fs.existsSync(`${os.homedir()}/dhti/docker-compose.yml`)) {
      fs.writeFileSync(`${os.homedir()}/dhti/docker-compose.yml`, '', 'utf8');
    }
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Compose)

    // console.log('args', args) //args { op: 'add' }
    // console.log('flags', flags) //flags { module: [ 'default', 'langserve', 'redis' ] }

    const openmrs = ['gateway', 'frontend', 'backend', 'openmrs-db']
    const langserve = ['langserve']
    const ollama = ['ollama', 'ollama-webui']
    const langfuse = ['langfuse', 'postgres-db']
    const cqlFhir = ['fhir', 'postgres-db', 'cql-elm', 'cql-web']
    const redis = ['redis', 'redis-commander']
    const neo4j = ['neo4j', 'fhirg']
    const gateway = ['gateway']
    const webui = ['ollama-webui']
    const fhir = ['fhir', 'postgres-db']
    const mcpFhir = ['mcp-fhir', 'fhir', 'postgres-db']


    const _modules: {[key: string]: string[]} = {
      cqlFhir,
      fhir,
      gateway,
      langfuse,
      langserve,
      mcpFhir,
      neo4j,
      ollama,
      openmrs,
      redis,
      webui
    }

    try {

      const masterData: any = yaml.load(fs.readFileSync('src/resources/docker-compose-master.yml', 'utf8'));
      let existingData:any = {services: {}, version: '3.8'};
      if (fs.existsSync(flags.file)) {
          existingData = yaml.load(fs.readFileSync(flags.file, 'utf8'));
      } else {
        Compose.init(); // Create the file if it does not exist
      }

      // Echo the existing data to the console
      if (args.op === 'read') {
        console.log(existingData);
        return;
      }

      // Delete flags.file if args.op is reset
      if (args.op === 'reset') {
        fs.unlinkSync(flags.file);
        Compose.init(); // Recreate the file
      }

      // if existing data is not null and arg is delete, remove the modules from the existing data
      if (Object.keys(existingData.services).length > 0 && args.op === 'delete') {
        // Expand the modules to remove using _modules object
        let modulesToDelete: any[] = [];
        for (const module of flags.module ?? []) {
          modulesToDelete = modulesToDelete.concat(_modules[module]);
        }

        for (const module of modulesToDelete ?? []) {
          if (existingData.services[module]) {
            delete existingData.services[module];
          }
        }
      }

      // if arg is add, add the modules from the master data
      if (args.op === 'add') {
        // Expand the modules to add using _modules object
        let modulesToAdd: any[] = [];
        for (const module of flags.module ?? []) {
          modulesToAdd = modulesToAdd.concat(_modules[module]);
        }

        for (const module of modulesToAdd ?? []) {
          existingData.services[module] = masterData.services[module];
        }
      }

      // Add all volumes from master data to existing data by default
      existingData.volumes = {};
      for (const key of Object.keys(masterData.volumes)) {
        existingData.volumes[key] = masterData.volumes[key];
      }

      const toWrite = yaml.dump(existingData).replaceAll('null', '');

      console.log('Writing file:', toWrite);

      fs.writeFileSync(flags.file, toWrite, 'utf8');

    } catch (error) {
      console.error(error);
    }
  }
}
