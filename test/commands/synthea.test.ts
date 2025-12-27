import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import {existsSync, mkdirSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

describe('synthea', () => {
  const testWorkdir = join(tmpdir(), 'dhti-test-synthea')

  beforeEach(() => {
    // Clean up test directory before each test
    if (existsSync(testWorkdir)) {
      rmSync(testWorkdir, {force: true, recursive: true})
    }
  })

  after(() => {
    // Clean up after all tests
    if (existsSync(testWorkdir)) {
      rmSync(testWorkdir, {force: true, recursive: true})
    }
  })

  describe('install', () => {
    it('runs install with dry-run flag', async () => {
      const {stdout} = await runCommand(['synthea', 'install', '--dry-run'])
      expect(stdout).to.contain('[DRY RUN]')
      expect(stdout).to.contain('Synthea installation simulation')
      expect(stdout).to.contain('Working directory')
      expect(stdout).to.contain('synthea-with-dependencies.jar')
    })

    it('runs install with custom workdir', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'install',
        '--dry-run',
        '-w',
        testWorkdir,
      ])
      expect(stdout).to.contain(testWorkdir)
      expect(stdout).to.contain('synthea')
    })
  })

  describe('generate', () => {
    it('runs generate with dry-run flag', async () => {
      const {stdout} = await runCommand(['synthea', 'generate', '--dry-run'])
      expect(stdout).to.contain('[DRY RUN]')
      expect(stdout).to.contain('Synthetic data generation simulation')
      expect(stdout).to.contain('synthea-with-dependencies.jar')
      expect(stdout).to.contain('synthea_data')
    })

    it('runs generate with custom population', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'generate',
        '--dry-run',
        '-p',
        '50',
      ])
      expect(stdout).to.contain('Population: 50 patients')
    })

    it('runs generate with state flag', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'generate',
        '--dry-run',
        '--state',
        'California',
      ])
      expect(stdout).to.contain('State: California')
    })

    it('runs generate with city flag', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'generate',
        '--dry-run',
        '-c',
        'Boston',
      ])
      expect(stdout).to.contain('City: Boston')
    })

    it('runs generate with gender flag', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'generate',
        '--dry-run',
        '-g',
        'F',
      ])
      expect(stdout).to.contain('Gender: F')
    })

    it('runs generate with age range', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'generate',
        '--dry-run',
        '-a',
        '0-18',
      ])
      expect(stdout).to.contain('Age range: 0-18')
    })

    it('runs generate with seed', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'generate',
        '--dry-run',
        '-s',
        '12345',
      ])
      expect(stdout).to.contain('Random seed: 12345')
    })

    it('runs generate with all flags combined', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'generate',
        '--dry-run',
        '-p',
        '100',
        '--state',
        'Texas',
        '-c',
        'Austin',
        '-g',
        'M',
        '-a',
        '25-65',
        '-s',
        '42',
      ])
      expect(stdout).to.contain('Population: 100 patients')
      expect(stdout).to.contain('State: Texas')
      expect(stdout).to.contain('City: Austin')
      expect(stdout).to.contain('Gender: M')
      expect(stdout).to.contain('Age range: 25-65')
      expect(stdout).to.contain('Random seed: 42')
    })
  })

  describe('upload', () => {
    it('runs upload with dry-run flag', async () => {
      const {stdout} = await runCommand(['synthea', 'upload', '--dry-run'])
      expect(stdout).to.contain('[DRY RUN]')
      expect(stdout).to.contain('FHIR upload simulation')
      expect(stdout).to.contain('synthea_data/fhir')
      expect(stdout).to.contain('http://fhir:8005/baseR4')
    })

    it('runs upload with custom endpoint', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'upload',
        '--dry-run',
        '-e',
        'http://localhost:8080/fhir',
      ])
      expect(stdout).to.contain('Endpoint: http://localhost:8080/fhir')
    })

    it('runs upload with bearer token', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'upload',
        '--dry-run',
        '-t',
        'test-token-123',
      ])
      expect(stdout).to.contain('Authentication: Bearer token')
    })

    it('runs upload with custom workdir', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'upload',
        '--dry-run',
        '-w',
        testWorkdir,
      ])
      expect(stdout).to.contain(testWorkdir)
    })
  })

  describe('delete', () => {
    it('runs delete with dry-run flag', async () => {
      const {stdout} = await runCommand(['synthea', 'delete', '--dry-run'])
      expect(stdout).to.contain('[DRY RUN]')
      expect(stdout).to.contain('Data deletion simulation')
      expect(stdout).to.contain('synthea_data')
    })

    it('runs delete with custom workdir', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'delete',
        '--dry-run',
        '-w',
        testWorkdir,
      ])
      expect(stdout).to.contain(testWorkdir)
    })
  })

  describe('download', () => {
    it('displays message when no dataset selected', async () => {
      const {stdout} = await runCommand(['synthea', 'download'])
      expect(stdout).to.contain('No dataset selected')
      expect(stdout).to.contain('--covid19')
      expect(stdout).to.contain('--synthea_sample_data_fhir_latest')
    })

    it('runs download with covid19 dataset', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'download',
        '--dry-run',
        '--covid19',
      ])
      expect(stdout).to.contain('Dataset: covid19')
      expect(stdout).to.contain('covid19_1k.zip')
    })

    it('runs download with covid19_10k dataset', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'download',
        '--dry-run',
        '--covid19_10k',
      ])
      expect(stdout).to.contain('Dataset: covid19_10k')
      expect(stdout).to.contain('covid19_10k.zip')
    })

    it('runs download with covid19_csv dataset', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'download',
        '--dry-run',
        '--covid19_csv',
      ])
      expect(stdout).to.contain('Dataset: covid19_csv')
    })

    it('runs download with covid19_csv_10k dataset', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'download',
        '--dry-run',
        '--covid19_csv_10k',
      ])
      expect(stdout).to.contain('Dataset: covid19_csv_10k')
    })

    it('runs download with synthea_sample_data_csv_latest dataset', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'download',
        '--dry-run',
        '--synthea_sample_data_csv_latest',
      ])
      expect(stdout).to.contain('Dataset: synthea_sample_data_csv_latest')
    })

    it('runs download with synthea_sample_data_fhir_latest dataset', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'download',
        '--dry-run',
        '--synthea_sample_data_fhir_latest',
      ])
      expect(stdout).to.contain('Dataset: synthea_sample_data_fhir_latest')
    })

    it('runs download with synthea_sample_data_fhir_stu3_latest dataset', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'download',
        '--dry-run',
        '--synthea_sample_data_fhir_stu3_latest',
      ])
      expect(stdout).to.contain('Dataset: synthea_sample_data_fhir_stu3_latest')
    })

    it('displays available datasets when none selected', async () => {
      const {stdout} = await runCommand(['synthea', 'download'])
      expect(stdout).to.contain('No dataset selected')
      expect(stdout).to.contain('--covid19')
      expect(stdout).to.contain('--synthea_sample_data_fhir_latest')
    })

    it('runs download with dry-run and dataset selected', async () => {
      const {stdout} = await runCommand(['synthea', 'download', '--dry-run', '--covid19'])
      expect(stdout).to.contain('[DRY RUN]')
      expect(stdout).to.contain('Dataset download simulation')
      expect(stdout).to.contain('Dataset: covid19')
    })

    it('runs download with custom workdir', async () => {
      const {stdout} = await runCommand([
        'synthea',
        'download',
        '--dry-run',
        '--covid19',
        '-w',
        testWorkdir,
      ])
      expect(stdout).to.contain(testWorkdir)
    })
  })

  describe('error handling', () => {
    it('runs download with dry-run but no dataset selected', async () => {
      const {stdout} = await runCommand(['synthea', 'download', '--dry-run'])
      expect(stdout).to.contain('[DRY RUN]')
      expect(stdout).to.contain('Dataset download simulation')
    })
  })

  describe('integration scenarios', () => {
    it('shows appropriate workflow in dry-run mode', async () => {
      // Simulate full workflow with dry-run
      const installOutput = await runCommand(['synthea', 'install', '--dry-run'])
      expect(installOutput.stdout).to.contain('installation')

      const generateOutput = await runCommand([
        'synthea',
        'generate',
        '--dry-run',
        '-p',
        '10',
      ])
      expect(generateOutput.stdout).to.contain('generation')

      const uploadOutput = await runCommand(['synthea', 'upload', '--dry-run'])
      expect(uploadOutput.stdout).to.contain('upload')

      const deleteOutput = await runCommand(['synthea', 'delete', '--dry-run'])
      expect(deleteOutput.stdout).to.contain('deletion')
    })
  })
})
