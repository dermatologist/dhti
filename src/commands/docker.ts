import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import yaml from 'js-yaml'
import {exec as execCallback} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import {promisify} from 'node:util'
import ora from 'ora'

import {DockerComposeConfig} from '../types/index.js'

const exec = promisify(execCallback)

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
    gateway: Flags.boolean({char: 'g', default: false, description: 'Restart the gateway container'}),
    name: Flags.string({char: 'n', description: 'Name of the container to build'}),
    restart: Flags.string({char: 'r', description: 'Restart a specific container by name'}),
    type: Flags.string({char: 't', default: 'elixir', description: 'Type of the service (elixir/conch)'}),
    up: Flags.boolean({char: 'u', default: false, description: 'Run docker-compose up after building'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Docker)

    if (flags.up) {
      const upCommand = `docker compose -f ${flags.file} up -d`
      if (flags['dry-run']) {
        this.log(chalk.yellow('[DRY RUN] Would execute:'))
        this.log(chalk.cyan(`  ${upCommand}`))
        return
      }

      try {
        const {stderr, stdout} = await exec(upCommand)
        if (stdout) this.log(`stdout: ${stdout}`)
        if (stderr) this.log(`stderr: ${stderr}`)
        this.log('Docker compose up successful')
      } catch (error) {
        this.error(`Failed to start containers: ${error}`)
      }

      return
    }

    if (flags.down) {
      const downCommand = `docker compose -f ${flags.file} down`
      if (flags['dry-run']) {
        this.log(chalk.yellow('[DRY RUN] Would execute:'))
        this.log(chalk.cyan(`  ${downCommand}`))
        return
      }

      try {
        const {stderr, stdout} = await exec(downCommand)
        if (stdout) this.log(`stdout: ${stdout}`)
        if (stderr) this.log(`stderr: ${stderr}`)
        this.log('Docker compose down successful')
      } catch (error) {
        this.error(`Failed to stop containers: ${error}`)
      }

      return
    }

    if (flags.gateway || flags.restart) {
      // Validate that only one restart option is provided
      if (flags.gateway && flags.restart) {
        this.error('Cannot use both --gateway and --restart flags at the same time', {exit: 1})
      }

      const containerName = flags.gateway ? 'dhti-gateway-1' : flags.restart

      // Validate container name to prevent command injection
      if (containerName && !/^[\w-]+$/.test(containerName)) {
        this.error(
          'Invalid container name. Container names can only contain letters, numbers, hyphens, and underscores.',
          {exit: 1},
        )
      }

      const restartCommand = `docker restart ${containerName}`

      if (flags['dry-run']) {
        this.log(chalk.yellow('[DRY RUN] Would execute:'))
        this.log(chalk.cyan(`  ${restartCommand}`))
        return
      }

      try {
        const {stderr, stdout} = await exec(restartCommand)
        this.log(`Successfully restarted container: ${containerName}`)
        if (stdout) this.log(`stdout: ${stdout}`)
        if (stderr) this.log(`stderr: ${stderr}`)
      } catch (error) {
        this.error(`Failed to restart container ${containerName}: ${error}`)
      }

      return
    }

    if (args.path !== 'bootstrap' && !flags.name && !flags.up && !flags.down && !flags.gateway && !flags.restart) {
      this.error('Please provide a name for the container to build', {exit: 1})
    }

    if (args.path === 'bootstrap') {
      // if flags.file does not end with bootstrap.py then exit
      if (!flags.file.endsWith('bootstrap.py')) {
        this.error('Please provide a valid path to bootstrap.py file')
      }

      // Determine copy direction based on whether local file exists
      const fileExists = fs.existsSync(flags.file)
      const copyCommand = fileExists
        ? `docker cp ${flags.file} ${flags.container}:/app/app/bootstrap.py`
        : `docker cp ${flags.container}:/app/app/bootstrap.py ${flags.file}`
      const restartCommand = `docker restart ${flags.container}`

      if (flags['dry-run']) {
        this.log(chalk.yellow('[DRY RUN] Would execute:'))
        const direction = fileExists ? 'to container' : 'from container'
        this.log(chalk.cyan(`  ${copyCommand} (copy ${direction})`))
        this.log(chalk.cyan(`  ${restartCommand}`))
        return
      }

      try {
        // copy file and only restart after copy completes
        const {stderr: copyStderr, stdout: copyStdout} = await exec(copyCommand)
        if (copyStdout) this.log(`stdout: ${copyStdout}`)
        if (copyStderr) this.log(`stderr: ${copyStderr}`)

        // restart the container only after copy completes
        const {stderr: restartStderr, stdout: restartStdout} = await exec(restartCommand)
        if (restartStdout) this.log(`stdout: ${restartStdout}`)
        if (restartStderr) this.log(`stderr: ${restartStderr}`)

        this.log('Bootstrap file copied and container restarted successfully')
      } catch (error) {
        this.error(`Failed to copy bootstrap file: ${error}`)
      }

      return
    }

    // cd to path, docker build tag with name
    const buildCommand = `cd ${args.path}/${flags.type} && docker build -t ${flags.name} . > /dev/null 2>&1`

    if (flags['dry-run']) {
      this.log(chalk.yellow('[DRY RUN] Would execute:'))
      this.log(chalk.cyan(`  ${buildCommand}`))
      this.log(chalk.yellow('[DRY RUN] Would update docker-compose file: ${flags.file}'))
      if (flags.type === 'elixir') {
        this.log(chalk.green(`  Set langserve.image = ${flags.name}`))
        this.log(chalk.green(`  Set langserve.pull_policy = if_not_present`))
      } else {
        this.log(chalk.green(`  Set frontend.image = ${flags.name}`))
        this.log(chalk.green(`  Set frontend.pull_policy = if_not_present`))
      }

      return
    }

    const spinner = ora('Running docker build ..').start()
    try {
      await exec(buildCommand)
      spinner.succeed('Docker build successful')
    } catch (error) {
      spinner.fail('Docker build failed')
      this.error(`Failed to build Docker image: ${error}`)
    } finally {
      spinner.stop()
    }

    // read the docker-compose file
    if (!fs.existsSync(flags.file)) {
      this.error(`The file "${flags.file}" does not exist.`)
    }

    const dockerCompose: DockerComposeConfig = yaml.load(fs.readFileSync(flags.file, 'utf8')) as DockerComposeConfig
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
    this.log(chalk.green(`Successfully built ${flags.name} and updated docker-compose file`))
  }
}
