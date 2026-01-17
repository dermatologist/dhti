import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import yaml from 'js-yaml'
import {exec} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {promisify} from 'node:util'

const execAsync = promisify(exec)

export default class Compose extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (add, delete, read or reset)'}),
  }

  static override description = 'Generates a docker-compose.yml file from a list of modules'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    'dry-run': Flags.boolean({
      default: false,
      description: 'Show what changes would be made without actually making them',
    }),
    env: Flags.string({
      char: 'e',
      description: 'Environment variable name (e.g. FHIR_BASE_URL)',
    }),
    file: Flags.string({
      char: 'f',
      default: `${os.homedir()}/dhti/docker-compose.yml`,
      description: 'Full path to the docker compose file to read from. Creates if it does not exist',
    }),
    host: Flags.boolean({
      default: false,
      description: 'Use host environment variable pattern (e.g. ${VAR_NAME:-default_value})',
    }),
    // flag with a value (-n, --name=VALUE)
    module: Flags.string({
      char: 'm',
      description:
        'Modules to add from ( langserve, openmrs, ollama, langfuse, cqlFhir, redis, neo4j, mcpFhir, mcpx and docktor)',
      multiple: true,
    }),
    service: Flags.string({
      char: 's',
      default: 'langserve',
      description: 'Service name to update environment variables',
    }),
    value: Flags.string({
      char: 'v',
      description: 'Environment variable value',
    }),
  }

  public static init = () => {
    // Create ${os.homedir()}/dhti if it does not exist
    if (!fs.existsSync(`${os.homedir()}/dhti`)) {
      fs.mkdirSync(`${os.homedir()}/dhti`)
    }

    // Create ${os.homedir()}/dhti/docker-compose.yml if it does not exist
    if (!fs.existsSync(`${os.homedir()}/dhti/docker-compose.yml`)) {
      fs.writeFileSync(`${os.homedir()}/dhti/docker-compose.yml`, '', 'utf8')
    }
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Compose)

    // Resolve resources directory for both dev (src) and packaged (dist)
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const RESOURCES_DIR = path.resolve(__dirname, '../resources')

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
    const mcpx = ['mcpx']
    const docktor = ['mcpx']
    const medplum = ['medplum-server', 'medplum-app', 'postgres-db', 'redis', 'mpclient']

    const _modules: {[key: string]: string[]} = {
      cqlFhir,
      docktor,
      fhir,
      gateway,
      langfuse,
      langserve,
      mcpFhir,
      mcpx,
      medplum,
      neo4j,
      ollama,
      openmrs,
      redis,
      webui,
    }

    try {
      const masterData: any = yaml.load(fs.readFileSync(path.join(RESOURCES_DIR, 'docker-compose-master.yml'), 'utf8'))
      let existingData: any = {services: {}, version: '3.8'}
      if (fs.existsSync(flags.file)) {
        existingData = yaml.load(fs.readFileSync(flags.file, 'utf8'))
      } else if (flags['dry-run']) {
        console.log(chalk.yellow(`[DRY RUN] Would create directory: ${os.homedir()}/dhti`))
        console.log(chalk.yellow(`[DRY RUN] Would create file: ${flags.file}`))
      } else {
        Compose.init() // Create the file if it does not exist
      }

      // Echo the existing data to the console
      if (args.op === 'read') {
        console.log(existingData)
        return
      }

      // Handle env operation to add or update environment variables
      if (args.op === 'env') {
        // Validate mandatory flags
        if (!flags.env) {
          console.error(chalk.red('Error: --env flag is required for env operation'))
          this.exit(1)
        }

        if (!flags.value) {
          console.error(chalk.red('Error: --value flag is required for env operation'))
          this.exit(1)
        }

        const serviceName = flags.service
        const envVarName = flags.env
        let envVarValue = flags.value

        // Apply host pattern if --host flag is present
        if (flags.host) {
          // eslint-disable-next-line no-template-curly-in-string
          envVarValue = `\${${envVarName}:-${flags.value}}`
        }

        // Check if service exists
        if (!existingData.services[serviceName]) {
          console.error(chalk.red(`Error: Service '${serviceName}' not found in docker-compose.yml`))
          this.exit(1)
        }

        const service = existingData.services[serviceName]

        // Initialize environment array if not present
        if (!service.environment) {
          service.environment = []
        }

        // Find if the environment variable already exists
        const envArray = service.environment
        let foundIndex = -1
        let oldValue: string | undefined

        // Handle environment as array of strings or objects
        for (const [index, env] of envArray.entries()) {
          if (typeof env === 'string') {
            if (env.startsWith(`${envVarName}=`)) {
              foundIndex = index
              oldValue = env.split('=').slice(1).join('=')
              break
            }
          } else if (typeof env === 'object' && env !== null && envVarName in env) {
            foundIndex = index
            oldValue = (env as Record<string, string>)[envVarName]
            break
          }
        }

        if (flags['dry-run']) {
          console.log(chalk.yellow('[DRY RUN] Would update environment variable:'))
          console.log(chalk.cyan(`  Service: ${serviceName}`))
          console.log(chalk.cyan(`  Variable: ${envVarName}`))
          if (foundIndex >= 0) {
            console.log(chalk.yellow(`  Old value: ${oldValue}`))
            console.log(chalk.green(`  New value: ${envVarValue}`))
          } else {
            console.log(chalk.green(`  Adding new value: ${envVarValue}`))
          }

          console.log(chalk.cyan(`  Would run: docker compose up -d (in ${path.dirname(flags.file)})`))
          return
        }

        // Update or add the environment variable
        if (foundIndex >= 0) {
          // Update existing
          const existingEnv = envArray[foundIndex]
          if (typeof existingEnv === 'string') {
            envArray[foundIndex] = `${envVarName}=${envVarValue}`
          } else if (typeof existingEnv === 'object' && existingEnv !== null) {
            ;(existingEnv as Record<string, string>)[envVarName] = envVarValue
          }

          console.log(chalk.blue(`Updating environment variable in service '${serviceName}':`))
          console.log(chalk.yellow(`  Old value: ${oldValue}`))
          console.log(chalk.green(`  New value: ${envVarValue}`))
        } else {
          // Add new
          envArray.push(`${envVarName}=${envVarValue}`)
          console.log(chalk.blue(`Adding new environment variable to service '${serviceName}':`))
          console.log(chalk.green(`  ${envVarName}=${envVarValue}`))
        }

        // Write the updated compose file
        const updatedCompose = yaml.dump(existingData).replaceAll('null', '')
        fs.writeFileSync(flags.file, updatedCompose, 'utf8')
        console.log(chalk.green(`✓ docker-compose.yml updated successfully`))

        // Run docker compose up -d to apply changes
        try {
          const workdir = path.dirname(flags.file)
          await execAsync('docker compose up -d', {cwd: workdir})
          console.log(chalk.green(`✓ Docker compose reloaded successfully (docker compose up -d)`))
        } catch (error: unknown) {
          const err = error as {message?: string}
          console.warn(chalk.yellow(`⚠ Warning: Could not run docker compose up -d: ${err.message}`))
        }

        return
      }

      // Delete flags.file if args.op is reset
      if (args.op === 'reset') {
        if (flags['dry-run']) {
          console.log(chalk.yellow(`[DRY RUN] Would delete file: ${flags.file}`))
          console.log(chalk.yellow(`[DRY RUN] Would recreate file: ${flags.file}`))
        } else {
          fs.unlinkSync(flags.file)
          Compose.init() // Recreate the file
        }
      }

      // if existing data is not null and arg is delete, remove the modules from the existing data
      if (Object.keys(existingData.services).length > 0 && args.op === 'delete') {
        // Expand the modules to remove using _modules object
        let modulesToDelete: any[] = []
        for (const module of flags.module ?? []) {
          modulesToDelete = modulesToDelete.concat(_modules[module])
        }

        if (flags['dry-run']) {
          console.log(chalk.yellow('[DRY RUN] Would delete the following modules:'))
          for (const module of modulesToDelete ?? []) {
            if (existingData.services[module]) {
              console.log(chalk.cyan(`  - ${module}`))
            }
          }
        } else {
          for (const module of modulesToDelete ?? []) {
            if (existingData.services[module]) {
              delete existingData.services[module]
            }
          }
        }
      }

      // if arg is add, add the modules from the master data
      if (args.op === 'add') {
        // Expand the modules to add using _modules object
        let modulesToAdd: any[] = []
        for (const module of flags.module ?? []) {
          modulesToAdd = modulesToAdd.concat(_modules[module])
        }

        if (flags['dry-run']) {
          console.log(chalk.yellow('[DRY RUN] Would add the following modules:'))
          for (const module of modulesToAdd ?? []) {
            console.log(chalk.cyan(`  - ${module}`))
          }
        } else {
          for (const module of modulesToAdd ?? []) {
            existingData.services[module] = masterData.services[module]
          }
        }
      }

      // Add all volumes from master data to existing data by default
      if (!flags['dry-run']) {
        existingData.volumes = {}
        for (const key of Object.keys(masterData.volumes)) {
          existingData.volumes[key] = masterData.volumes[key]
        }
      }

      const toWrite = yaml.dump(existingData).replaceAll('null', '')

      if (flags['dry-run']) {
        console.log(chalk.yellow(`[DRY RUN] Would write to file: ${flags.file}`))
        console.log(chalk.green('[DRY RUN] File content would be:'))
        console.log(toWrite)
      } else {
        console.log('Writing file:', toWrite)
        fs.writeFileSync(flags.file, toWrite, 'utf8')
      }
    } catch (error) {
      console.error(error)
    }
  }
}
