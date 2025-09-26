import {Args, Command, Flags} from '@oclif/core'
import {exec} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
export default class Conch extends Command {
  static override args = {
    op: Args.string({description: 'Operation to perform (install, uninstall or dev)'}),
  }

  static override description = 'Install or uninstall conchs to create a Docker image'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    branch: Flags.string({char: 'b', default: 'develop', description: 'Branch to install from'}),
    container: Flags.string({
      char: 'c',
      default: 'dhti-frontend-1',
      description: 'Name of the container to copy the conch to while in dev mode',
    }),
    dev: Flags.string({char: 'd', default: 'none', description: 'Dev folder to install'}),
    git: Flags.string({char: 'g', default: 'none', description: 'Github repository to install'}),
    image: Flags.string({
      char: 'i',
      default: 'openmrs/openmrs-reference-application-3-frontend:3.0.0-beta.17',
      description: 'Base image to use for the conch',
    }),
    name: Flags.string({char: 'n', description: 'Name of the elixir'}),
    repoVersion: Flags.string({char: 'v', default: '1.0.0', description: 'Version of the conch'}),
    workdir: Flags.string({
      char: 'w',
      default: `${os.homedir()}/dhti`,
      description: 'Working directory to install the conch',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Conch)

    // Resolve resources directory for both dev (src) and packaged (dist)
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const RESOURCES_DIR = path.resolve(__dirname, '../resources')

    if (!flags.name) {
      console.log('Please provide a name for the conch')
      this.exit(1)
    }

    // if arg is dev then copy to docker as below
    // docker cp ../../openmrs-esm-genai/dist/. dhti-frontend-1:/usr/share/nginx/html/openmrs-esm-genai-1.0.0
    // docker restart dhti-frontend-1
    if (args.op === 'dev') {
      console.log(
        `cd ${flags.dev} && yarn build && docker cp dist/. ${flags.container}:/usr/share/nginx/html/${flags.name}-${flags.repoVersion}`,
      )
      try {
        exec(
          `cd ${flags.dev} && yarn build && docker cp dist/. ${flags.container}:/usr/share/nginx/html/${flags.name}-${flags.repoVersion}`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`)
              return
            }

            console.log(`stdout: ${stdout}`)
            console.error(`stderr: ${stderr}`)
          },
        )
        exec(`docker restart ${flags.container}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            return
          }

          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
        })
      } catch (error) {
        console.log('Error copying conch to container', error)
      }
    }

    // Create a directory to install the elixir
    if (!fs.existsSync(`${flags.workdir}/conch`)) {
      fs.mkdirSync(`${flags.workdir}/conch`)
    }

    fs.cpSync(path.join(RESOURCES_DIR, 'spa'), `${flags.workdir}/conch`, {recursive: true})

    // Rewrite files

    const rewrite = () => {
      flags.name = flags.name ?? 'openmrs-esm-genai'
      // Read and process importmap.json
      const importmap = JSON.parse(fs.readFileSync(`${flags.workdir}/conch/def/importmap.json`, 'utf8'))
      if (args.op === 'install')
        importmap.imports[
          flags.name.replace('openmrs-', '@openmrs/')
        ] = `./${flags.name}-${flags.repoVersion}/${flags.name}.js`
      if (args.op === 'uninstall') delete importmap.imports[flags.name.replace('openmrs-', '@openmrs/')]
      fs.writeFileSync(`${flags.workdir}/conch/def/importmap.json`, JSON.stringify(importmap, null, 2))

      // Read and process spa-assemble-config.json
      const spaAssembleConfig = JSON.parse(
        fs.readFileSync(`${flags.workdir}/conch/def/spa-assemble-config.json`, 'utf8'),
      )
      if (args.op === 'install')
        spaAssembleConfig.frontendModules[flags.name.replace('openmrs-', '@openmrs/')] = `${flags.repoVersion}`
      if (args.op === 'uninstall') delete spaAssembleConfig.frontendModules[flags.name.replace('openmrs-', '@openmrs/')]
      fs.writeFileSync(
        `${flags.workdir}/conch/def/spa-assemble-config.json`,
        JSON.stringify(spaAssembleConfig, null, 2),
      )

      // Read and process Dockerfile
      let dockerfile = fs.readFileSync(`${flags.workdir}/conch/Dockerfile`, 'utf8')
      dockerfile = dockerfile
        .replaceAll('conch', flags.name)
        .replaceAll('version', flags.repoVersion)
        .replaceAll('server-image', flags.image)
      fs.writeFileSync(`${flags.workdir}/conch/Dockerfile`, dockerfile)
      // Read routes.json
      const routes = JSON.parse(fs.readFileSync(`${flags.workdir}/conch/${flags.name}/src/routes.json`, 'utf8'))
      // Add to routes.registry.json
      const registry = JSON.parse(fs.readFileSync(`${flags.workdir}/conch/def/routes.registry.json`, 'utf8'))
      if (args.op === 'install') registry[flags.name.replace('openmrs-', '@openmrs/')] = routes
      if (args.op === 'uninstall') delete registry[flags.name.replace('openmrs-', '@openmrs/')]
      fs.writeFileSync(`${flags.workdir}/conch/def/routes.registry.json`, JSON.stringify(registry, null, 2))
    }

    if (flags.git !== 'none') {
      // git clone the repository
      exec(`git clone ${flags.git} ${flags.workdir}/conch/${flags.name}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`)
          return
        }

        // Checkout the branch
        exec(`cd ${flags.workdir}/conch/${flags.name} && git checkout ${flags.branch}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`)
            return
          }

          rewrite()

          console.log(`stdout: ${stdout}`)
          console.error(`stderr: ${stderr}`)
        })

        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
      })
    }

    // If flags.dev is not none, copy the dev folder to the conch directory
    if (flags.dev !== 'none' && args.op !== 'dev') {
      fs.cpSync(flags.dev, `${flags.workdir}/conch/${flags.name}`, {recursive: true})
      rewrite()
    }
  }
}
