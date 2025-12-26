import {Args, Command, Flags} from '@oclif/core'
import chalk from 'chalk'

export default class Mimic extends Command {
  static override args = {
    server: Args.string({default: 'http://localhost/fhir/$import', description: 'Server URL to submit'}), // object with input, instruction (rationale in distillation), output
  }

  static override description = 'Submit a FHIR request to a server'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    'dry-run': Flags.boolean({
      default: false,
      description: 'Show what changes would be made without actually making them',
    }),
    token: Flags.string({
      char: 't',
      description: 'Bearer token for authentication (optional)',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Mimic)

    // Ensure server URL ends with /$import
    let serverUrl = args.server
    if (!serverUrl.endsWith('/$import')) {
      serverUrl = serverUrl.replace(/\/$/, '') + '/$import'
    }

    const mimic_request = `{

  "resourceType": "Parameters",

  "parameter": [ {

    "name": "inputFormat",

    "valueCode": "application/fhir+ndjson"

  }, {

    "name": "inputSource",

    "valueUri": "http://example.com/fhir/"

  }, {

    "name": "storageDetail",

    "part": [ {

      "name": "type",

      "valueCode": "https"

    }, {

      "name": "credentialHttpBasic",

      "valueString": "admin:password"

    }, {

      "name": "maxBatchResourceCount",

      "valueString": "500"

    } ]

  }, {

    "name": "input",

    "part": [ {

      "name": "type",

      "valueCode": "Observation"

    }, {

      "name": "url",

      "valueUri": "https://physionet.org/files/mimic-iv-fhir-demo/2.0/mimic-fhir/ObservationLabevents.ndjson"

    } ]

  }, {

    "name": "input",

    "part": [ {

      "name": "type",

      "valueCode": "Medication"

    }, {

      "name": "url",

      "valueUri": "https://physionet.org/files/mimic-iv-fhir-demo/2.0/mimic-fhir/Medication.ndjson"

    } ]

  }, {

    "name": "input",

    "part": [ {

      "name": "type",

      "valueCode": "Procedure"

    }, {

      "name": "url",

      "valueUri": "https://physionet.org/files/mimic-iv-fhir-demo/2.0/mimic-fhir/Procedure.ndjson"

    } ]

  }, {

    "name": "input",

    "part": [ {

      "name": "type",

      "valueCode": "Condition"

    }, {

      "name": "url",

      "valueUri": "https://physionet.org/files/mimic-iv-fhir-demo/2.0/mimic-fhir/Condition.ndjson"

    } ]

  }, {

    "name": "input",

    "part": [ {

      "name": "type",

      "valueCode": "Patient"

    }, {

      "name": "url",

      "valueUri": "https://physionet.org/files/mimic-iv-fhir-demo/2.0/mimic-fhir/Patient.ndjson"

    } ]

  } ]

}`

    if (flags['dry-run']) {
      console.log(chalk.yellow(`[DRY RUN] Would send POST request to: ${serverUrl}`))
      console.log(chalk.cyan('[DRY RUN] Request headers:'))
      console.log(chalk.green('  Content-Type: application/fhir+json'))
      console.log(chalk.green('  Prefer: respond-async'))
      if (flags.token) {
        console.log(chalk.green('  Authorization: Bearer <token>'))
      }
      console.log(chalk.cyan('[DRY RUN] Request body:'))
      console.log(mimic_request)
      return
    }

    // Build request headers
    const headers: {[key: string]: string} = {
      'Content-Type': 'application/fhir+json',
      Prefer: 'respond-async',
    }
    if (flags.token) {
      headers.Authorization = `Bearer ${flags.token}`
    }

    // send a POST request to the server with the mimic_request body
    const response = await fetch(serverUrl, {
      body: mimic_request,
      headers,
      method: 'POST',
    })
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`)
    }
  }
}
