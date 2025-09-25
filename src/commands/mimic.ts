import {Args, Command, Flags} from '@oclif/core'

export default class Mimic extends Command {
  static override args = {
    server: Args.string({default: 'http://localhost/fhir/$import', description: 'Server URL to submit'}), // object with input, instruction (rationale in distillation), output
  }

  static override description = 'Submit a FHIR request to a server'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Mimic)
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
    // send a POST request to the server with the mimic_request body
    const response = await fetch(args.server, {
      body: mimic_request,
      headers: {
        'Content-Type': 'application/fhir+json',
        Prefer: 'respond-async',
      },
      method: 'POST',
    })
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`)
      return
    }
  }
}
