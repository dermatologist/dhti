# Synthea Command Documentation

## Overview

The `synthea` command provides a comprehensive interface for managing synthetic FHIR data generation using [Synthea](https://github.com/synthetichealth/synthea), a synthetic patient generator. Synthea creates realistic synthetic patient records with complete medical histories in FHIR format.

## Table of Contents

- [Installation](#installation)
- [Subcommands](#subcommands)
  - [install](#install)
  - [generate](#generate)
  - [upload](#upload)
  - [delete](#delete)
  - [download](#download)
- [Common Flags](#common-flags)
- [Workflow Examples](#workflow-examples)
- [FHIR Resources Generated](#fhir-resources-generated)
- [Troubleshooting](#troubleshooting)

## Installation

The Synthea command is part of the DHTI CLI. No additional installation is required beyond having the DHTI CLI installed.

### Prerequisites

- **Java Runtime Environment (JRE)**: Version 8 or higher must be installed to run Synthea
- **Node.js**: Version 18 or higher (for DHTI CLI)
- **unzip**: Required for extracting downloaded datasets (usually pre-installed on most systems)

To verify Java installation:
```bash
java -version
```

## Subcommands

### install

Downloads and installs the Synthea JAR file to your working directory.

**Usage:**
```bash
dhti-cli synthea install [FLAGS]
```

**Flags:**
- `-w, --workdir <path>`: Working directory (default: `~/dhti`)
- `--dry-run`: Show what would be done without executing

**What it does:**
1. Creates a `synthea` directory in your working directory
2. Downloads `synthea-with-dependencies.jar` from the official Synthea GitHub releases
3. Displays usage instructions

**Example:**
```bash
# Install with default settings
dhti-cli synthea install

# Install to custom directory
dhti-cli synthea install -w /path/to/custom/dir

# Preview what would happen
dhti-cli synthea install --dry-run
```

**Output:**
The command will create the following structure:
```
~/dhti/
└── synthea/
    └── synthea-with-dependencies.jar
```

### generate

Generates synthetic patient data using Synthea.

**Usage:**
```bash
dhti-cli synthea generate [FLAGS]
```

**Flags:**
- `-w, --workdir <path>`: Working directory (default: `~/dhti`)
- `-p, --population <number>`: Number of patients to generate (default: 1)
- `--state <name>`: State for patient generation (default: Massachusetts)
- `-c, --city <name>`: City for patient generation
- `-g, --gender <M|F>`: Generate patients of specific gender
- `-a, --age <range>`: Age range (e.g., "0-18" for pediatric, "65-100" for elderly)
- `-s, --seed <number>`: Random seed for reproducible generation
- `--dry-run`: Show what would be done without executing

**What it does:**
1. Checks for Synthea JAR installation
2. Creates `synthea_data` directory if it doesn't exist
3. Runs Synthea with specified parameters
4. Generates FHIR resources in JSON format

**Examples:**
```bash
# Generate 10 patients with default settings
dhti-cli synthea generate -p 10

# Generate 50 female pediatric patients in California
dhti-cli synthea generate -p 50 -g F -a 0-18 --state California

# Generate patients in a specific city
dhti-cli synthea generate -p 25 -c Boston --state Massachusetts

# Generate with reproducible seed
dhti-cli synthea generate -p 100 -s 12345

# Preview generation
dhti-cli synthea generate -p 10 --dry-run
```

**Output:**
Generated data will be placed in:
```
~/dhti/synthea_data/
├── fhir/
│   ├── AllergyIntolerance.json
│   ├── CarePlan.json
│   ├── Condition.json
│   ├── DiagnosticReport.json
│   ├── Encounter.json
│   ├── Goal.json
│   ├── Immunization.json
│   ├── MedicationRequest.json
│   ├── Observation.json
│   ├── Patient.json
│   ├── Procedure.json
│   └── ... (more resource types)
├── csv/
│   └── ... (CSV format data)
└── ... (other formats)
```

### upload

Uploads generated FHIR resources to a FHIR server.

**Usage:**
```bash
dhti-cli synthea upload [FLAGS]
```

**Flags:**
- `-w, --workdir <path>`: Working directory (default: `~/dhti`)
- `-e, --endpoint <url>`: FHIR server endpoint (default: `http://fhir:8005/baseR4`)
- `-t, --token <token>`: Bearer token for authentication (optional)
- `--dry-run`: Show what would be done without executing

**What it does:**
1. Reads all JSON files from `synthea_data/fhir` directory
2. Parses each file to determine resource type
3. POSTs each resource to the FHIR server endpoint
4. Provides a summary of successful and failed uploads

**Examples:**
```bash
# Upload to default server
dhti-cli synthea upload

# Upload to custom FHIR server
dhti-cli synthea upload -e http://localhost:8080/fhir/r4

# Upload with authentication
dhti-cli synthea upload -e http://secure-fhir.example.com/baseR4 -t your-bearer-token

# Preview upload without executing
dhti-cli synthea upload --dry-run
```

**Output:**
```
Found 150 FHIR resource files
[1/150] Uploading Patient_001.json...
  ✓ Uploaded Patient_001.json
[2/150] Uploading Observation_001.json...
  ✓ Uploaded Observation_001.json
...
============================================================
Upload Summary
============================================================
  ✓ Successful: 148
  ✗ Failed: 2
  Total: 150
============================================================
```

### delete

Deletes all synthetic data from the synthea_data directory.

**Usage:**
```bash
dhti-cli synthea delete [FLAGS]
```

**Flags:**
- `-w, --workdir <path>`: Working directory (default: `~/dhti`)
- `--dry-run`: Show what would be done without executing

**What it does:**
1. Counts files in `synthea_data` directory
2. Prompts for confirmation (requires typing "yes")
3. Recursively deletes the entire directory

**Examples:**
```bash
# Delete data from default location
dhti-cli synthea delete

# Delete from custom directory
dhti-cli synthea delete -w /path/to/custom/dir

# Preview deletion
dhti-cli synthea delete --dry-run
```

**Safety:**
- Requires explicit "yes" confirmation (not just "y")
- Use `--dry-run` to preview what would be deleted

### download

Downloads pre-generated Synthea datasets from synthea.mitre.org.

**Usage:**
```bash
dhti-cli synthea download [DATASET_FLAGS]
```

**Dataset Flags:**
- `--covid19`: COVID-19 dataset with 1,000 patients
- `--covid19_10k`: COVID-19 dataset with 10,000 patients
- `--covid19_csv`: COVID-19 CSV dataset with 1,000 patients
- `--covid19_csv_10k`: COVID-19 CSV dataset with 10,000 patients
- `--synthea_sample_data_csv_latest`: Latest CSV sample data
- `--synthea_sample_data_fhir_latest`: Latest FHIR sample data
- `--synthea_sample_data_fhir_stu3_latest`: Latest FHIR STU3 sample data

**Common Flags:**
- `-w, --workdir <path>`: Working directory (default: `~/dhti`)
- `--dry-run`: Show what would be done without executing

**What it does:**
1. Downloads selected dataset(s) to `/tmp/synthea_downloads`
2. Extracts the ZIP file to `synthea_data` directory
3. Makes data immediately available for upload

**Examples:**
```bash
# Download COVID-19 dataset
dhti-cli synthea download --covid19

# Download multiple datasets
dhti-cli synthea download --covid19_10k --synthea_sample_data_fhir_latest

# Download to custom directory
dhti-cli synthea download --covid19 -w /path/to/custom/dir

# Preview download
dhti-cli synthea download --covid19 --dry-run

# See available datasets
dhti-cli synthea download
```

**Dataset Details:**

| Dataset | Format | Patients | Description |
|---------|--------|----------|-------------|
| covid19 | FHIR | 1,000 | COVID-19 synthetic patients |
| covid19_10k | FHIR | 10,000 | COVID-19 synthetic patients (large) |
| covid19_csv | CSV | 1,000 | COVID-19 patients in CSV format |
| covid19_csv_10k | CSV | 10,000 | COVID-19 patients in CSV format (large) |
| synthea_sample_data_csv_latest | CSV | Varies | Latest general sample data (CSV) |
| synthea_sample_data_fhir_latest | FHIR R4 | Varies | Latest general sample data (FHIR R4) |
| synthea_sample_data_fhir_stu3_latest | FHIR STU3 | Varies | Latest general sample data (FHIR STU3) |

## Common Flags

All subcommands support the following flags:

- `-w, --workdir <path>`: Specifies the working directory (default: `~/dhti`)
  - All data is stored relative to this directory
  - Can be changed to organize different projects

- `--dry-run`: Preview mode
  - Shows what the command would do without executing
  - Useful for testing and understanding command behavior
  - No files are created, downloaded, or deleted in dry-run mode

## Workflow Examples

### Complete Workflow: Generate and Upload

```bash
# 1. Install Synthea
dhti-cli synthea install

# 2. Generate 50 patients
dhti-cli synthea generate -p 50

# 3. Upload to FHIR server
dhti-cli synthea upload -e http://localhost:8080/fhir

# 4. Clean up when done
dhti-cli synthea delete
```

### Using Pre-generated Data

```bash
# 1. Download COVID-19 dataset
dhti-cli synthea download --covid19_10k

# 2. Upload to FHIR server
dhti-cli synthea upload -e http://fhir-server.example.com/baseR4 -t your-token

# 3. Clean up
dhti-cli synthea delete
```

### Custom Patient Population

```bash
# Generate elderly male patients in Florida
dhti-cli synthea generate \
  -p 100 \
  -g M \
  -a 65-100 \
  --state Florida \
  -c Miami

# Generate pediatric patients with reproducible seed
dhti-cli synthea generate \
  -p 200 \
  -a 0-18 \
  -s 42 \
  --state California
```

### Testing with Dry Run

```bash
# Preview entire workflow without executing
dhti-cli synthea install --dry-run
dhti-cli synthea generate -p 100 --dry-run
dhti-cli synthea upload -e http://test-server --dry-run
dhti-cli synthea delete --dry-run
```

### Multiple Projects

```bash
# Project 1: Pediatric study
dhti-cli synthea generate -p 100 -a 0-18 -w ~/dhti/pediatric
dhti-cli synthea upload -e http://pediatric-fhir -w ~/dhti/pediatric

# Project 2: Adult study
dhti-cli synthea generate -p 200 -a 25-65 -w ~/dhti/adult
dhti-cli synthea upload -e http://adult-fhir -w ~/dhti/adult
```

## FHIR Resources Generated

Synthea generates realistic FHIR R4 resources including:

### Core Resources
- **Patient**: Demographics, contact information, identifiers
- **Encounter**: Inpatient, outpatient, emergency, urgent care visits
- **Observation**: Vital signs, lab results, social history

### Clinical Resources
- **Condition**: Diagnoses with onset and resolution dates
- **Procedure**: Surgical and diagnostic procedures
- **MedicationRequest**: Prescriptions with dosage and timing
- **Immunization**: Vaccination history
- **AllergyIntolerance**: Documented allergies

### Care Planning
- **CarePlan**: Treatment and care plans
- **Goal**: Patient care goals
- **CareTeam**: Healthcare team members

### Diagnostics
- **DiagnosticReport**: Lab reports and imaging results
- **Specimen**: Laboratory specimens
- **ImagingStudy**: Radiology studies

### Financial
- **Claim**: Insurance claims
- **ExplanationOfBenefit**: EOB records

### Administrative
- **Organization**: Healthcare facilities
- **Practitioner**: Healthcare providers
- **Location**: Facility locations

## Troubleshooting

### Common Issues

**1. "Synthea JAR not found"**
```bash
# Solution: Install Synthea first
dhti-cli synthea install
```

**2. "Java not found" or "java: command not found"**
```bash
# Solution: Install Java Runtime Environment
# On Ubuntu/Debian:
sudo apt-get install default-jre

# On macOS:
brew install openjdk

# Verify installation:
java -version
```

**3. "FHIR data directory not found"**
```bash
# Solution: Generate data first
dhti-cli synthea generate -p 10
```

**4. Upload failures**
- Check FHIR server endpoint is correct and accessible
- Verify authentication token if using secured endpoint
- Check server logs for specific error messages
- Some resources may have dependencies (e.g., Observations reference Patients)

**5. "unzip: command not found" during download**
```bash
# Solution: Install unzip utility
# On Ubuntu/Debian:
sudo apt-get install unzip

# On macOS (usually pre-installed):
brew install unzip
```

**6. Large dataset downloads are slow**
- Large datasets (10k patients) can be several hundred MB
- Use progress indicator to monitor download
- Consider using smaller datasets for testing

### Performance Tips

**Generation:**
- Generating large populations (>1000 patients) can be time-consuming
- Each patient takes approximately 5-10 seconds to generate
- Use `-s` flag with same seed for reproducible results

**Upload:**
- Uploading many resources can be slow depending on network and server
- Consider batch upload if FHIR server supports FHIR Batch/Transaction
- Monitor server resources during large uploads

**Storage:**
- 100 patients ≈ 50-100 MB of FHIR JSON data
- 1000 patients ≈ 500 MB - 1 GB
- Plan storage accordingly for large populations

## Advanced Usage

### Custom Synthea Properties

For advanced configuration, you can modify Synthea properties after installation:

```bash
cd ~/dhti/synthea
# Create or edit synthea.properties
nano synthea.properties
```

Common properties:
- `exporter.fhir.export`: Enable/disable FHIR export (default: true)
- `exporter.csv.export`: Enable/disable CSV export (default: true)
- `generate.providers.hospitals`: Number of hospitals
- `generate.providers.longterm`: Include long-term care facilities

### Integration with DHTI Workflow

The Synthea command integrates seamlessly with other DHTI commands:

```bash
# 1. Set up environment with Docker
dhti-cli compose add -m fhir -m frontend

# 2. Generate synthetic data
dhti-cli synthea generate -p 100

# 3. Upload to local FHIR server
dhti-cli synthea upload -e http://localhost:8080/fhir

# 4. Test with other DHTI tools
dhti-cli mimic http://localhost:8080/fhir
```

## Resources

- **Synthea GitHub**: https://github.com/synthetichealth/synthea
- **Synthea Wiki**: https://github.com/synthetichealth/synthea/wiki
- **Synthea Downloads**: https://synthea.mitre.org/downloads
- **FHIR R4 Specification**: https://hl7.org/fhir/R4/
- **DHTI GitHub**: https://github.com/dermatologist/dhti

## Support

For issues or questions:
- File an issue on the DHTI GitHub repository
- Refer to Synthea documentation for generation-specific issues
- Check FHIR server logs for upload-related problems

## License

The Synthea command is part of DHTI CLI, licensed under Apache-2.0. Synthea itself is also Apache-2.0 licensed.
