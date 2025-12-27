import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import {exec} from 'node:child_process'
import {createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync} from 'node:fs'
import {homedir} from 'node:os'
import {join} from 'node:path'
import {createInterface} from 'node:readline'
import {promisify} from 'node:util'

const execAsync = promisify(exec)

/**
 * Type definition for command flags
 */
interface SyntheaFlags {
  [key: string]: unknown
  age?: string
  city?: string
  covid19?: boolean
  // eslint-disable-next-line camelcase
  covid19_10k?: boolean
  // eslint-disable-next-line camelcase
  covid19_csv?: boolean
  // eslint-disable-next-line camelcase
  covid19_csv_10k?: boolean
  'dry-run': boolean
  endpoint: string
  gender?: string
  population: number
  seed?: string
  state?: string
  // eslint-disable-next-line camelcase
  synthea_sample_data_csv_latest?: boolean
  // eslint-disable-next-line camelcase
  synthea_sample_data_fhir_latest?: boolean
  // eslint-disable-next-line camelcase
  synthea_sample_data_fhir_stu3_latest?: boolean
  token?: string
  workdir: string
}

/**
 * Synthea command for managing synthetic FHIR data generation
 * 
 * This command provides subcommands to:
 * - install: Download and install Synthea JAR file
 * - generate: Generate synthetic FHIR data using Synthea
 * - upload: Upload generated FHIR resources to a FHIR server
 * - delete: Clean up generated synthetic data
 * - download: Download pre-generated Synthea datasets
 */
export default class Synthea extends Command {
  static override args = {
    subcommand: Args.string({
      description: 'Subcommand to execute: install, generate, upload, delete, download',
      options: ['install', 'generate', 'upload', 'delete', 'download'],
      required: true,
    }),
  }

  static override description = 'Manage Synthea synthetic FHIR data generation'

  static override examples = [
    '<%= config.bin %> <%= command.id %> install',
    '<%= config.bin %> <%= command.id %> generate -p 10',
    '<%= config.bin %> <%= command.id %> upload -e http://fhir:8005/baseR4',
    '<%= config.bin %> <%= command.id %> delete',
    '<%= config.bin %> <%= command.id %> download --covid19',
  ]

  static override flags = {
    // Generate flags
    age: Flags.string({
      char: 'a',
      description: 'Generate patients with specific age range (e.g., "0-18" for pediatric)',
    }),
    city: Flags.string({
      char: 'c',
      description: 'City for patient generation',
    }),

    // Download flags - various datasets from synthea.mitre.org
    covid19: Flags.boolean({
      description: 'Download COVID-19 dataset (1k patients)',
    }),
    // eslint-disable-next-line camelcase
    covid19_10k: Flags.boolean({
      description: 'Download COVID-19 dataset (10k patients)',
    }),
    // eslint-disable-next-line camelcase
    covid19_csv: Flags.boolean({
      description: 'Download COVID-19 CSV dataset (1k patients)',
    }),
    // eslint-disable-next-line camelcase
    covid19_csv_10k: Flags.boolean({
      description: 'Download COVID-19 CSV dataset (10k patients)',
    }),
    // Common flags
    'dry-run': Flags.boolean({
      default: false,
      description: 'Show what changes would be made without actually making them',
    }),
    // Upload flags
    endpoint: Flags.string({
      char: 'e',
      default: 'http://fhir:8005/baseR4',
      description: 'FHIR server endpoint URL',
    }),

    gender: Flags.string({
      char: 'g',
      description: 'Generate patients of specific gender (M or F)',
      options: ['M', 'F'],
    }),
    population: Flags.integer({
      char: 'p',
      default: 1,
      description: 'Number of patients to generate',
    }),

    seed: Flags.string({
      char: 's',
      description: 'Random seed for reproducible generation',
    }),
    state: Flags.string({
      description: 'State for patient generation (default: Massachusetts)',
    }),
    // eslint-disable-next-line camelcase
    synthea_sample_data_csv_latest: Flags.boolean({
      description: 'Download latest CSV sample data',
    }),
    // eslint-disable-next-line camelcase
    synthea_sample_data_fhir_latest: Flags.boolean({
      description: 'Download latest FHIR sample data',
    }),
    // eslint-disable-next-line camelcase
    synthea_sample_data_fhir_stu3_latest: Flags.boolean({
      description: 'Download latest FHIR STU3 sample data',
    }),
    token: Flags.string({
      char: 't',
      description: 'Bearer token for FHIR server authentication',
    }),
    workdir: Flags.string({
      char: 'w',
      default: join(homedir(), 'dhti'),
      description: 'Working directory for Synthea files',
    }),
  }

  /**
   * Main command execution
   * Dispatches to appropriate subcommand handler
   * @returns Promise that resolves when subcommand completes
   */
  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Synthea)

    // Execute appropriate subcommand
    switch (args.subcommand) {
      case 'install': {
        await this.install(flags)
        break
      }

      case 'generate': {
        await this.generate(flags)
        break
      }

      case 'upload': {
        await this.upload(flags)
        break
      }

      case 'delete': {
        await this.delete(flags)
        break
      }

      case 'download': {
        await this.download(flags)
        break
      }

      default: {
        this.error(`Unknown subcommand: ${args.subcommand}`)
      }
    }
  }

  /**
   * Delete synthetic data
   * @param flags Command flags including workdir and dry-run
   * @returns Promise that resolves when deletion completes
   */
  private async delete(flags: SyntheaFlags): Promise<void> {
    const dataDir = join(flags.workdir, 'synthea_data')

    if (flags['dry-run']) {
      console.log(chalk.yellow('[DRY RUN] Data deletion simulation'))
      console.log(chalk.cyan(`  Data directory: ${dataDir}`))
      console.log(chalk.green('[DRY RUN] Would delete all files in synthea_data directory'))
      return
    }

    // Check if directory exists
    if (!existsSync(dataDir)) {
      console.log(chalk.yellow(`⚠ Directory does not exist: ${dataDir}`))
      return
    }

    // Count files
    let fileCount = 0
    const countFiles = (dir: string): void => {
      const items = readdirSync(dir)
      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          countFiles(fullPath)
        } else {
          fileCount++
        }
      }
    }

    countFiles(dataDir)

    console.log(chalk.yellow(`⚠ About to delete ${fileCount} files from: ${dataDir}`))

    // Confirmation prompt
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const answer = await new Promise<string>((resolve) => {
      rl.question(chalk.red('Are you sure you want to delete all data? (yes/N): '), resolve)
    })
    rl.close()

    if (answer.toLowerCase() !== 'yes') {
      console.log(chalk.blue('Deletion cancelled.'))
      return
    }

    // Delete directory
    try {
      rmSync(dataDir, {force: true, recursive: true})
      console.log(chalk.green(`✓ Deleted: ${dataDir}`))
    } catch (error) {
      this.error(
        `Failed to delete directory: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Download pre-generated Synthea datasets
   * @param flags Command flags including workdir, dataset selections, and dry-run
   * @returns Promise that resolves when download completes
   */
  private async download(flags: SyntheaFlags): Promise<void> {
    const tmpDir = '/tmp/synthea_downloads'
    const outputDir = join(flags.workdir, 'synthea_data')

    // Map of dataset flags to download URLs
    // eslint-disable-next-line camelcase
    const datasets: {[key: string]: {file: string; url: string}} = {
      covid19: {
        file: 'covid19.zip',
        url: 'https://synthea.mitre.org/downloads/covid19_1k.zip',
      },
      // eslint-disable-next-line camelcase
      covid19_10k: {
        file: 'covid19_10k.zip',
        url: 'https://synthea.mitre.org/downloads/covid19_10k.zip',
      },
      // eslint-disable-next-line camelcase
      covid19_csv: {
        file: 'covid19_csv.zip',
        url: 'https://synthea.mitre.org/downloads/covid19_csv_1k.zip',
      },
      // eslint-disable-next-line camelcase
      covid19_csv_10k: {
        file: 'covid19_csv_10k.zip',
        url: 'https://synthea.mitre.org/downloads/covid19_csv_10k.zip',
      },
      // eslint-disable-next-line camelcase
      synthea_sample_data_csv_latest: {
        file: 'synthea_sample_data_csv_latest.zip',
        url: 'https://synthea.mitre.org/downloads/synthea_sample_data_csv_latest.zip',
      },
      // eslint-disable-next-line camelcase
      synthea_sample_data_fhir_latest: {
        file: 'synthea_sample_data_fhir_latest.zip',
        url: 'https://synthea.mitre.org/downloads/synthea_sample_data_fhir_latest.zip',
      },
      // eslint-disable-next-line camelcase
      synthea_sample_data_fhir_stu3_latest: {
        file: 'synthea_sample_data_fhir_stu3_latest.zip',
        url: 'https://synthea.mitre.org/downloads/synthea_sample_data_fhir_stu3_latest.zip',
      },
    }

    // Find which dataset to download
    const selectedDatasets = Object.keys(datasets).filter((key) => flags[key])

    if (selectedDatasets.length === 0) {
      if (flags['dry-run']) {
        console.log(chalk.yellow('[DRY RUN] Dataset download simulation'))
        console.log(chalk.yellow('⚠ No dataset selected. Use one of the following flags:'))
      } else {
        console.log(chalk.yellow('⚠ No dataset selected. Use one of the following flags:'))
      }

      for (const [key] of Object.entries(datasets)) {
        console.log(chalk.cyan(`  --${key}`))
      }

      return
    }

    if (flags['dry-run']) {
      console.log(chalk.yellow('[DRY RUN] Dataset download simulation'))
      console.log(chalk.cyan(`  Temporary directory: ${tmpDir}`))
      console.log(chalk.cyan(`  Output directory: ${outputDir}`))
      for (const dataset of selectedDatasets) {
        console.log(chalk.cyan(`  Dataset: ${dataset}`))
        console.log(chalk.cyan(`    URL: ${datasets[dataset].url}`))
      }

      console.log(chalk.green('[DRY RUN] Would download and extract selected datasets'))
      return
    }

    // Create directories
    if (!existsSync(tmpDir)) {
      mkdirSync(tmpDir, {recursive: true})
    }

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, {recursive: true})
    }

    // Download and extract each selected dataset
    // Note: Sequential processing is intentional to avoid overwhelming the server
    // eslint-disable-next-line no-await-in-loop
    for (const datasetKey of selectedDatasets) {
      const dataset = datasets[datasetKey]
      const downloadPath = join(tmpDir, dataset.file)

      console.log(chalk.blue(`\nDownloading ${datasetKey}...`))
      console.log(chalk.gray(`URL: ${dataset.url}`))

      try {
        // Download file
        // eslint-disable-next-line no-await-in-loop
        const response = await fetch(dataset.url)
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.statusText}`)
        }

        const fileStream = createWriteStream(downloadPath)
        // @ts-expect-error - ReadableStream types from fetch
        const reader = response.body.getReader()

        let downloadedBytes = 0
        const contentLength = Number.parseInt(response.headers.get('content-length') || '0', 10)

        // eslint-disable-next-line no-constant-condition
        while (true) {
          // eslint-disable-next-line no-await-in-loop
          const {done, value} = await reader.read()
          if (done) break

          downloadedBytes += value.length
          fileStream.write(value)

          if (contentLength > 0) {
            const progress = Math.round((downloadedBytes / contentLength) * 100)
            process.stdout.write(`\rDownloading: ${progress}%`)
          }
        }

        fileStream.end()
        console.log('\n' + chalk.green(`✓ Downloaded ${dataset.file}`))

        // Extract ZIP file
        console.log(chalk.blue('Extracting...'))
        // eslint-disable-next-line no-await-in-loop
        await execAsync(`unzip -o "${downloadPath}" -d "${outputDir}"`)
        console.log(chalk.green(`✓ Extracted to ${outputDir}`))
      } catch (error) {
        console.log(
          chalk.red(
            `✗ Failed to download ${datasetKey}: ${error instanceof Error ? error.message : String(error)}`,
          ),
        )
      }
    }

    console.log(chalk.green(`\n✓ Download complete. Data available at: ${outputDir}`))
  }

  /**
   * Generate synthetic FHIR data
   * @param flags Command flags including population, state, city, gender, age, seed, workdir, and dry-run
   * @returns Promise that resolves when generation completes
   */
  private async generate(flags: SyntheaFlags): Promise<void> {
    const syntheaDir = join(flags.workdir, 'synthea')
    const jarPath = join(syntheaDir, 'synthea-with-dependencies.jar')
    const outputDir = join(flags.workdir, 'synthea_data')

    if (flags['dry-run']) {
      console.log(chalk.yellow('[DRY RUN] Synthetic data generation simulation'))
      console.log(chalk.cyan(`  Synthea JAR: ${jarPath}`))
      console.log(chalk.cyan(`  Output directory: ${outputDir}`))
      console.log(chalk.cyan(`  Population: ${flags.population} patients`))
      if (flags.state) console.log(chalk.cyan(`  State: ${flags.state}`))
      if (flags.city) console.log(chalk.cyan(`  City: ${flags.city}`))
      if (flags.gender) console.log(chalk.cyan(`  Gender: ${flags.gender}`))
      if (flags.age) console.log(chalk.cyan(`  Age range: ${flags.age}`))
      if (flags.seed) console.log(chalk.cyan(`  Random seed: ${flags.seed}`))
      console.log(chalk.green('[DRY RUN] Would create output directory'))
      console.log(chalk.green('[DRY RUN] Would execute Synthea JAR to generate data'))
      return
    }

    // Check if JAR exists
    if (!existsSync(jarPath)) {
      console.log(
        chalk.red(
          `✗ Synthea JAR not found at: ${jarPath}\nRun 'dhti-cli synthea install' first.`,
        ),
      )
      this.exit(1)
    }

    // Create output directory
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, {recursive: true})
      console.log(chalk.green(`✓ Created output directory: ${outputDir}`))
    }

    // Build Synthea command
    const javaArgs = ['-jar', jarPath]

    // Add optional flags
    if (flags.population) javaArgs.push('-p', String(flags.population))
    if (flags.state) javaArgs.push('-s', flags.state)
    if (flags.city) javaArgs.push('-c', flags.city)
    if (flags.gender) javaArgs.push('-g', flags.gender)
    if (flags.age) javaArgs.push('-a', flags.age)
    if (flags.seed) javaArgs.push('--seed', flags.seed)

    // Set output directory
    javaArgs.push('--exporter.baseDirectory', outputDir)

    console.log(chalk.blue('Generating synthetic data...'))
    console.log(chalk.gray(`Command: java ${javaArgs.join(' ')}`))

    try {
      const {stderr, stdout} = await execAsync(`java ${javaArgs.join(' ')}`, {
        cwd: syntheaDir,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      })

      if (stdout) console.log(stdout)
      if (stderr) console.error(chalk.yellow(stderr))

      console.log(chalk.green(`✓ Generated synthetic data in: ${outputDir}`))

      // Show FHIR output location
      const fhirDir = join(outputDir, 'fhir')
      if (existsSync(fhirDir)) {
        const files = readdirSync(fhirDir)
        console.log(chalk.cyan(`\nGenerated ${files.length} FHIR resource files`))
        console.log(chalk.white(`FHIR files location: ${fhirDir}`))
      }
    } catch (error) {
      this.error(
        `Failed to generate synthetic data: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Install Synthea JAR file
   * @param flags Command flags including workdir and dry-run
   * @returns Promise that resolves when installation completes
   */
  private async install(flags: SyntheaFlags): Promise<void> {
    const syntheaDir = join(flags.workdir, 'synthea')
    const jarPath = join(syntheaDir, 'synthea-with-dependencies.jar')

    if (flags['dry-run']) {
      console.log(chalk.yellow('[DRY RUN] Synthea installation simulation'))
      console.log(chalk.cyan(`  Working directory: ${flags.workdir}`))
      console.log(chalk.cyan(`  Synthea directory: ${syntheaDir}`))
      console.log(chalk.cyan(`  JAR path: ${jarPath}`))
      console.log(chalk.green('[DRY RUN] Would create synthea directory'))
      console.log(chalk.green('[DRY RUN] Would download synthea-with-dependencies.jar'))
      console.log(chalk.green('[DRY RUN] Would display usage instructions'))
      return
    }

    // Create synthea directory
    if (!existsSync(syntheaDir)) {
      mkdirSync(syntheaDir, {recursive: true})
      console.log(chalk.green(`✓ Created directory: ${syntheaDir}`))
    }

    // Check if JAR already exists
    if (existsSync(jarPath)) {
      console.log(chalk.yellow(`⚠ Synthea JAR already exists at: ${jarPath}`))
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      const answer = await new Promise<string>((resolve) => {
        rl.question('Overwrite existing file? (y/N): ', resolve)
      })
      rl.close()

      if (answer.toLowerCase() !== 'y') {
        console.log(chalk.blue('Installation cancelled.'))
        return
      }
    }

    // Download synthea-with-dependencies.jar
    console.log(chalk.blue('Downloading synthea-with-dependencies.jar...'))
    const downloadUrl =
      'https://github.com/synthetichealth/synthea/releases/download/master-branch-latest/synthea-with-dependencies.jar'

    try {
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`)
      }

      const fileStream = createWriteStream(jarPath)
      // @ts-expect-error - ReadableStream types from fetch
      const reader = response.body.getReader()

      let downloadedBytes = 0
      const contentLength = Number.parseInt(response.headers.get('content-length') || '0', 10)

      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const {done, value} = await reader.read()
        if (done) break

        downloadedBytes += value.length
        fileStream.write(value)

        if (contentLength > 0) {
          const progress = Math.round((downloadedBytes / contentLength) * 100)
          process.stdout.write(`\rDownloading: ${progress}%`)
        }
      }

      fileStream.end()
      console.log('\n' + chalk.green(`✓ Downloaded synthea-with-dependencies.jar to ${jarPath}`))
    } catch (error) {
      this.error(
        `Failed to download Synthea JAR: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    // Display usage instructions
    console.log(chalk.cyan('\n' + '='.repeat(60)))
    console.log(chalk.bold.green('Synthea Installation Complete!'))
    console.log(chalk.cyan('='.repeat(60)))
    console.log(chalk.white('\nUsage Instructions:'))
    console.log(chalk.white('-------------------'))
    console.log(chalk.white('To generate synthetic data:'))
    console.log(chalk.yellow(`  ${this.config.bin} synthea generate -p 10`))
    console.log(chalk.white('\nTo upload data to FHIR server:'))
    console.log(chalk.yellow(`  ${this.config.bin} synthea upload -e http://fhir:8005/baseR4`))
    console.log(chalk.white('\nManual usage:'))
    console.log(chalk.yellow(`  cd ${syntheaDir}`))
    console.log(chalk.yellow('  java -jar synthea-with-dependencies.jar -p 10'))
    console.log(chalk.white('\nFor more options, see:'))
    console.log(chalk.blue('  https://github.com/synthetichealth/synthea/wiki/Basic-Setup-and-Running'))
    console.log(chalk.cyan('='.repeat(60) + '\n'))
  }

  /**
   * Upload FHIR resources to server
   * @param flags Command flags including endpoint, token, workdir, and dry-run
   * @returns Promise that resolves when upload completes
   */
  private async upload(flags: SyntheaFlags): Promise<void> {
    const fhirDir = join(flags.workdir, 'synthea_data', 'fhir')

    if (flags['dry-run']) {
      console.log(chalk.yellow('[DRY RUN] FHIR upload simulation'))
      console.log(chalk.cyan(`  FHIR directory: ${fhirDir}`))
      console.log(chalk.cyan(`  Endpoint: ${flags.endpoint}`))
      if (flags.token) console.log(chalk.cyan('  Authentication: Bearer token'))
      console.log(chalk.green('[DRY RUN] Would read FHIR resources from directory'))
      console.log(chalk.green('[DRY RUN] Would upload each resource to FHIR server'))
      return
    }

    // Check if FHIR directory exists
    if (!existsSync(fhirDir)) {
      console.log(
        chalk.red(
          `✗ FHIR data directory not found: ${fhirDir}\nRun 'dhti-cli synthea generate' first.`,
        ),
      )
      this.exit(1)
    }

    // Read all JSON files from FHIR directory
    const files = readdirSync(fhirDir).filter((f) => f.endsWith('.json'))

    if (files.length === 0) {
      console.log(chalk.yellow('⚠ No FHIR JSON files found in directory'))
      return
    }

    console.log(chalk.blue(`Found ${files.length} FHIR resource files`))

    // Prepare headers
    const headers: {[key: string]: string} = {
      'Content-Type': 'application/fhir+json',
    }
    if (flags.token) {
      headers.Authorization = `Bearer ${flags.token}`
    }

    let successCount = 0
    let failCount = 0

    // Upload each file
    // Note: Sequential processing is intentional to maintain order and avoid overwhelming server
    // eslint-disable-next-line no-await-in-loop
    for (const [index, file] of files.entries()) {
      const filePath = join(fhirDir, file)
      console.log(chalk.gray(`[${index + 1}/${files.length}] Uploading ${file}...`))

      try {
        const content = readFileSync(filePath, 'utf8')
        const resource = JSON.parse(content)

        // Determine resource type and construct URL
        const {resourceType} = resource
        if (!resourceType) {
          console.log(chalk.yellow(`  ⚠ Skipping ${file} - no resourceType`))
          continue
        }

        const url = `${flags.endpoint}/${resourceType}`

        // eslint-disable-next-line no-await-in-loop
        const response = await fetch(url, {
          body: content,
          headers,
          method: 'POST',
        })

        if (response.ok) {
          successCount++
          console.log(chalk.green(`  ✓ Uploaded ${file}`))
        } else {
          failCount++
          console.log(
            chalk.red(
              `  ✗ Failed to upload ${file}: ${response.status} ${response.statusText}`,
            ),
          )
        }
      } catch (error) {
        failCount++
        console.log(
          chalk.red(
            `  ✗ Error uploading ${file}: ${error instanceof Error ? error.message : String(error)}`,
          ),
        )
      }
    }

    // Summary
    console.log(chalk.cyan('\n' + '='.repeat(60)))
    console.log(chalk.bold.white('Upload Summary'))
    console.log(chalk.cyan('='.repeat(60)))
    console.log(chalk.green(`  ✓ Successful: ${successCount}`))
    console.log(chalk.red(`  ✗ Failed: ${failCount}`))
    console.log(chalk.white(`  Total: ${files.length}`))
    console.log(chalk.cyan('='.repeat(60) + '\n'))
  }
}
