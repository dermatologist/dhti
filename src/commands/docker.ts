import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import yaml from 'js-yaml'
import { exec } from 'node:child_process';
import fs from 'node:fs'
import os from 'node:os'
import ora from 'ora'
export default class Docker extends Command {
  static override args = {
    path: Args.string({default: `${os.homedir()}/dhti`, description: 'Docker project path to build. Ex: dhti'}),
  }

  static override description = 'Build a docker project and update docker-compose file'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    container: Flags.string({
      char: 'c',
      default: 'dhti-langserve-1',
      description: 'Name of the container to copy the bootstrap file to while in dev mode',
    }),
    down: Flags.boolean({char: 'd', default: false, description: 'Run docker-compose down after building'}),
    'dry-run': Flags.boolean({
      default: false,
      description: 'Show what changes would be made without actually making them',
    }),
    file: Flags.string({
      char: 'f',
      default: `${os.homedir()}/dhti/docker-compose.yml`,
      description: 'Full path to the docker compose file to edit or run.',
    }),
    name: Flags.string({char: 'n', description: 'Name of the container to build'}),
    type: Flags.string({char: 't', default: 'elixir', description: 'Type of the service (elixir/conch)'}),
    up: Flags.boolean({char: 'u', default: false, description: 'Run docker-compose up after building'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Docker)

    if (flags.up) {
      const upCommand = `docker compose -f ${flags.file} up -d`
      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute:'))
        console.log(chalk.cyan(`  ${upCommand}`))
        return
      }

      exec(upCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return
        }

        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
      })
      return
    }

    if (flags.down) {
      const downCommand = `docker compose -f ${flags.file} down`
      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute:'))
        console.log(chalk.cyan(`  ${downCommand}`))
        return
      }

      exec(downCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return
        }

        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
      })
      return
    }

    if (args.path !== 'bootstrap' && !flags.name && !flags.up && !flags.down) {
      console.log('Please provide a name for the container to build')
      this.exit(1)
    }

    if (args.path === 'bootstrap') {
      // if flags.file does not end with bootstrap.py then exit
      if (!flags.file.endsWith('bootstrap.py')) {
        console.log('Please provide a valid path to bootstrap.py file')
        this.exit(1)
      }

      const copyCommand = `docker cp ${flags.file} ${flags.container}:/app/app/bootstrap.py`
      const restartCommand = `docker restart ${flags.container}`
      
      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Would execute:'))
        console.log(chalk.cyan(`  ${copyCommand}`))
        console.log(chalk.cyan(`  ${restartCommand}`))
        return
      }

      // copy -f to container:/app/app/ and only restart after copy completes
      exec(copyCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return
        }

        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)

        // restart the container only after copy completes
        exec(restartCommand, (restartError, restartStdout, restartStderr) => {
          if (restartError) {
            console.error(`exec error: ${restartError}`)
            return
          }

          console.log(`stdout: ${restartStdout}`)
          console.error(`stderr: ${restartStderr}`)
        })
      })
      return
    }

    // cd to path, docker build tag with name
    const buildCommand = `cd ${args.path}/${flags.type} && docker build -t ${flags.name} . > /dev/null 2>&1`
    
    if (flags['dry-run']) {
      console.log(chalk.yellow('[DRY RUN] Would execute:'))
      console.log(chalk.cyan(`  ${buildCommand}`))
      console.log(chalk.yellow(`[DRY RUN] Would update docker-compose file: ${flags.file}`))
      if (flags.type === 'elixir') {
        console.log(chalk.green(`  Set langserve.image = ${flags.name}`))
        console.log(chalk.green(`  Set langserve.pull_policy = if_not_present`))
      } else {
        console.log(chalk.green(`  Set frontend.image = ${flags.name}`))
        console.log(chalk.green(`  Set frontend.pull_policy = if_not_present`))
      }

      return
    }

    const spinner = ora('Running docker build ..').start()
    exec(buildCommand, (error, stdout, stderr) => {
      if (error) {
        spinner.fail('Docker build failed')
        console.error(`exec error: ${error}`)
        return
      }

      spinner.succeed('Docker build successful')
      console.log(`stdout: ${stdout}`)
      console.error(`stderr: ${stderr}`)
    })

    // read the docker-compose file
    if (!fs.existsSync(flags.file)) {
      console.error(`Error: The file "${flags.file}" does not exist.`)
      this.exit(1)
    }

    const dockerCompose: any = yaml.load(fs.readFileSync(flags.file, 'utf8'))
    // if type is elixir set image of backend to name, else set image of frontend to name
    if (flags.type === 'elixir') {
      dockerCompose.services.langserve.image = flags.name
      dockerCompose.services.langserve.pull_policy = 'if_not_present'
    } else {
      dockerCompose.services.frontend.image = flags.name
      dockerCompose.services.frontend.pull_policy = 'if_not_present'
    }

    // write the docker-compose file
    fs.writeFileSync(flags.file, yaml.dump(dockerCompose))
  }
}
