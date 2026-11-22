---
name: conch-generator
description: This skill helps you generate a new OpenMRS ESM microfrontend (DHTI conch) from this template. Use this skill when you need to create a new DHTI-enabled microfrontend that integrates with the OpenMRS 3.x ecosystem.
---

## Skill Purpose

DHTI is a platform to rapidly prototype, share, and test GenAI healthcare applications within an EHR. This skill guides you through:

- Setting up a development environment
- Scaffolding a new microfrontend project for GenAI powered backend services
- Implementing patient-context-aware UI components for OpenMRS

## When to Use This Skill

Use this skill when you need to:

- Create a new OpenMRS ESM microfrontend from this template
- Integrate GenAI capabilities into an OpenMRS microfrontend
- Develop patient-context-aware UI components for OpenMRS

**Scope:** This skill is for conch (frontend) development only. If you need to create or modify an elixir (backend GenAI service), use the `elixir-generator` skill instead.

## Preflight Checks

Before starting, verify the following prerequisites:

1. **Node.js:** Ensure Node.js >= 18.0.0 is installed (`node --version`)
2. **Package Manager:** npm is required; Corepack and Yarn are used by the generated monorepo
3. **Git and Network:** Required for template cloning via `degit`
4. **CLI Source:** Determine if you're using:
   - **Published CLI:** `npx dhti-cli` (uses the latest published version)
   - **Local CLI:** If developing the CLI itself, run `npm install`, `npm run build`, and `npm link` in the dhti-cli repository, then verify with `dhti-cli --version`
5. **Workspace:** Ensure the target workspace directory doesn't already contain conflicting files

## Naming Conventions

Choose a simple, unique feature slug (e.g., `glycemic`, `heart-rate`, `skin-tone`). This skill uses the following naming mapping:

| Concept              | Value                   | Location                       |
| -------------------- | ----------------------- | ------------------------------ |
| Feature slug         | `<<name>>`              | Your chosen identifier         |
| Scaffold directory   | `esm-dhti-<<name>>`     | `packages/esm-dhti-<<name>>/`  |
| npm package name     | `@openmrs/esm-<<name>>` | `package.json`                 |
| Module name          | `@openmrs/esm-<<name>>` | `src/index.ts` (`moduleName`)  |
| Feature name         | `dhti-<<name>>`         | `src/index.ts` (`featureName`) |
| Lifecycle export     | `<<name>>`              | `src/index.ts` (export name)   |
| Route/extension name | `dhti-<<name>>-widget`  | `src/routes.json`              |

**Example:** For feature slug `glycemic`:

- Directory: `packages/esm-dhti-glycemic/`
- Package: `@openmrs/esm-glycemic`
- Module: `@openmrs/esm-glycemic`
- Feature: `dhti-glycemic`
- Export: `glycemic`
- Extension: `dhti-glycemic-widget`

## Environment Setup and Project Scaffolding

### Step 1: Read and Internalize Requirements

- Understand the clinical functionality needed
- Identify the UI components, extensions, workflows, and pages required
- Note the specific DHTI service route or service name that needs to be used
- Determine the OpenMRS mounting context (patient chart, visit workspace, form workspace, etc.)

### Step 2: Scaffold a New Microfrontend Project

**Dry-run first (recommended):**

```bash
npx dhti-cli conch init -w workspace -n esm-dhti-<<name>> --dry-run
```

**Execute scaffolding:**

```bash
npx dhti-cli conch init -w workspace -n esm-dhti-<<name>>
```

This creates:

- `workspace/openmrs-esm-dhti/` — the monorepo root
- `workspace/openmrs-esm-dhti/packages/esm-dhti-<<name>>/` — your conch package

**Idempotency:** If the target directory already exists or contains uncommitted changes, the command will fail. Remove or rename the existing directory before retrying.

### Step 3: Adapt the Generated Code

Navigate to your package: `workspace/openmrs-esm-dhti/packages/esm-dhti-<<name>>/`

**Update `package.json`:**

- Change the `name` field to `@openmrs/esm-<<name>>`
- Update `description`, `author`, and other metadata

**Update `src/index.ts`:**

- Set `moduleName` to `@openmrs/esm-<<name>>`
- Set `featureName` to `dhti-<<name>>`
- Rename the lifecycle export from `glycemic` to your feature slug (e.g., `heartRate`)
- Update the `import('./glycemic.component')` path to match your renamed component

**Rename component files (if applicable):**

- Rename `glycemic.component.tsx` to `<<name>>.component.tsx`
- Rename `glycemic.scss` to `<<name>>.scss`
- Update imports in `src/index.ts` accordingly

**Update `src/config-schema.ts`:**

- Update the `dhtiRoute` default to your DHTI service endpoint (see "GenAI Integration" below)
- Modify other config options as needed for your feature
- Keep all config parameters optional with reasonable defaults

**Update `src/translations/en.json`:**

- Replace template strings with your feature's translation keys

**Update `README.md`:**

- Write a short explanation of what you intend to build
- Include setup instructions and usage notes
- Link to planning or design documents if available

### Planning and Notes

**Write detailed notes** on what you plan to implement, how you plan to implement it, and any questions or uncertainties you have. Use the package-level `notes/` directory for this purpose:

- `workspace/openmrs-esm-dhti/packages/esm-dhti-<<name>>/notes/plan.md` — implementation plan
- `workspace/openmrs-esm-dhti/packages/esm-dhti-<<name>>/notes/todo.md` — detailed TODO list

**Plan UI components, extensions, workflows, and pages:**

- Review the generated package structure and dependencies before planning
- Read through the user requirements again and plan the UI components, extensions, workflows, and pages you will need
- Document component boundaries, lifecycle exports, route/extension names, config keys, API calls, loading/error states, and test cases
- Define the exact OpenMRS mounting context and expected prop contract
- Write down a list of components and their responsibilities in `notes/plan.md`

### Routing and Extension Setup

**Read the generated `src/index.ts` and `src/routes.json`** to understand the template's structure before planning extensions.

**The `src/index.ts` file** in an OpenMRS frontend module typically includes:

- **Imports:** Essential imports from `@openmrs/esm-framework` like `getSyncLifecycle`, `getAsyncLifecycle`, and `defineConfigSchema`. You may also import your React components here.
- **Module and Feature Names:** Constants defining the unique `moduleName` (conventionally prefixed with `@openmrs/esm-`) and a descriptive `featureName`.
- **startupApp function:** This function is the module's activator. It calls `defineConfigSchema` to register the module's configuration schema.
- **Lifecycle Exports:** Components, pages, extensions, modals, or workspaces are wrapped in lifecycle functions (`getSyncLifecycle` or `getAsyncLifecycle`) and exported as named constants. These exports are referenced in `src/routes.json`.
- **Translation Support:** An `importTranslation` constant tells the app shell where to find translation files.
- **Lifecycle choice:** Use `getSyncLifecycle` for simple components; use `getAsyncLifecycle` when the component requires async operations like data fetching.

**The `src/routes.json` file** defines routes and extensions:

- Each extension references a lifecycle export by name (the `component` field)
- The `slot` field determines where the extension renders (e.g., `patient-chart-summary-dashboard-slot`)
- Read `notes/slots.md` in the monorepo root to understand available extension slots
- Update `routes.json` to match your component exports and desired slots

### Patient and Encounter Data in Components

**Context availability depends on mounting:** When an ESM is rendered inside a patient context (e.g., patient chart, visit workspace, form workspace), the OpenMRS framework may inject context props into your root component. However, the exact props and hooks available depend on:

- The OpenMRS version and `@openmrs/esm-framework` dependency version in your generated package
- The route type and mounting context (patient chart vs. standalone page)
- The specific lifecycle and component signature

**Recommended approach:**

1. **Check the generated package's dependencies** in `package.json` to determine the `@openmrs/esm-framework` version
2. **Review the framework's type definitions** for the exact hook and prop signatures
3. **Test in the actual mounting context** to verify which props are available

**Common patterns (verify against your template):**

**A. Direct Props (when mounted in patient/encounter context):**

```tsx
interface Props {
  patientUuid?: string
  encounterUuid?: string
  visitUuid?: string
}

export default function MyComponent({patientUuid, encounterUuid}: Props) {
  return (
    <div>
      Patient: {patientUuid}
      Encounter: {encounterUuid}
    </div>
  )
}
```

**B. Using Framework Hooks (if available in your version):**

```tsx
import {usePatient, useVisit, useEncounter} from '@openmrs/esm-framework'

const MyComponent = () => {
  const patient = usePatient()
  const encounter = useEncounter()
  const visit = useVisit()

  console.log(patient?.uuid)
  console.log(encounter?.uuid)

  return <div>...</div>
}
```

**Important:** Do not assume these hooks or props are universally available. Always verify against the generated package's dependencies and the OpenMRS documentation for your specific version.

### GenAI Integration

**Getting GenAI outputs:**

- Use the local `useDhti` hook from the generated package's `src/hooks/useDhti.ts` (or the equivalent path in your template) to call the DHTI service and get GenAI outputs.
- The hook reads the DHTI service route from the module's configuration (`config?.dhtiRoute`).

**Configuring the DHTI route:**

1. **If the user provides a full URL:** Use it directly as the `dhtiRoute` default in `src/config-schema.ts`
2. **If the user provides only a service name:** Construct the route as:
   ```
   http://localhost:8001/langserve/dhti_elixir_<service-name>/cds-services/dhti-service
   ```
3. **If no service is specified:** Use the template's default value from `config-schema.ts` (typically `http://localhost:8001/langserve/dhti_elixir_template/cds-services/dhti-service`)

**Example `config-schema.ts` update:**

```typescript
dhtiRoute: {
  _type: Type.String,
  _default: 'http://localhost:8001/langserve/dhti_elixir_glycemic/cds-services/dhti-service',
  _description: 'Route for the DHTI GenAI Service',
},
```

**Using the hook in your component:**

```tsx
import {useDhti} from './hooks/useDhti'

const MyComponent = () => {
  const {submitMessage, loading, error} = useDhti()

  const handleRequest = async () => {
    const card = await submitMessage('Analyze patient data', patientUuid)
    // Handle the returned CDSHookCard
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <button onClick={handleRequest}>Request Analysis</button>
    </div>
  )
}
```

**Important:** The `useDhti` hook is part of the generated template, not a separate `esm-dhti-utils` package. Always use the hook from your package's local `src/hooks/` directory.

### Directory Structure

The generated monorepo structure:

```
workspace/
└── openmrs-esm-dhti/                    # Monorepo root
    ├── packages/
    │   ├── esm-starter-app/             # Template starter (reference only)
    │   └── esm-dhti-<<name>>/           # Your conch package
    │       ├── notes/
    │       │   ├── plan.md              # Implementation plan
    │       │   └── todo.md              # Detailed TODO list
    │       ├── src/
    │       │   ├── index.ts             # Module entry point (lifecycle exports)
    │       │   ├── routes.json          # Route and extension definitions
    │       │   ├── config-schema.ts     # Configuration schema
    │       │   ├── <<name>>.component.tsx  # Main component
    │       │   ├── <<name>>.scss        # Component styles
    │       │   ├── hooks/
    │       │   │   ├── useDhti.ts       # DHTI service hook
    │       │   │   └── usePatient.ts    # Patient data hook (if present)
    │       │   └── models/
    │       │       ├── request.ts       # CDS Hook request model
    │       │       └── card.ts          # CDS Hook card model
    │       ├── translations/
    │       │   └── en.json              # English translations
    │       ├── package.json             # Package metadata and dependencies
    │       └── README.md                # Package documentation
    └── notes/
        └── slots.md                     # Available extension slots reference
```

**Note:** This skill generates only the conch (frontend) structure. Elixir (backend) projects have a separate structure and are generated by the `elixir-generator` skill.

## Implementation Steps

**Start implementing the feature based on your plans:**

- Follow best practices for React and OpenMRS frontend-module development
- When in doubt, refer to the generated package's existing patterns and the OpenMRS documentation
- Test your code frequently to ensure it works as expected
- The user conversation may provide context on past work; internalize and reuse it where possible

**Implementation checklist:**

1. Update all naming (package.json, index.ts, routes.json, translations)
2. Implement component UI with loading, error, and empty states
3. Integrate `useDhti` hook for GenAI service calls
4. Handle patient context appropriately (verify props/hooks availability)
5. Register extensions/routes in `routes.json`
6. Add configuration options in `config-schema.ts`
7. Write unit tests with synthetic patient data and mocked network calls
8. Update README with purpose, setup, and usage instructions

### Testing

**Write tests:**

- Write unit and integration tests for your components and logic
- Use the testing framework set up in the template (typically Jest or similar)
- Use synthetic patient data and mocked network responses; do not include real patient data or credentials
- Ensure good test coverage to catch potential issues early

**Build and test commands:**

```bash
cd workspace/openmrs-esm-dhti
yarn install
yarn build
yarn test
```

**Validation steps:**

- Verify TypeScript compilation succeeds with no errors
- Check that all lifecycle exports are properly registered in `routes.json`
- Confirm configuration schema has reasonable defaults
- Run tests and ensure they pass
- Validate that no real PHI or credentials are included in code or tests

### Documentation

**Update documentation:**

- Update `README.md` with details about your microfrontend, including its purpose, setup instructions, and usage
- Document all configuration options in `config-schema.ts` with clear descriptions
- Add inline code comments for complex logic
- Extended notes and future plans can go in the `packages/esm-dhti-<<name>>/notes/` directory

### Running Locally

**Start the development server:**

```bash
cd workspace/openmrs-esm-dhti
corepack enable
yarn install
yarn start --sources 'packages/esm-dhti-<<name>>'
```

**Using the CLI:**

```bash
dhti-cli conch start --local workspace/openmrs-esm-dhti --sources 'packages/esm-dhti-<<name>>'
```

The development server will start and provide a URL to access the OpenMRS application with your conch loaded.

### Final Review and Cleanup

**Before completing:**

- Review your code for unused imports, variables, or commented-out code
- Ensure your code follows consistent styling and conventions
- Verify all naming is consistent across package.json, index.ts, routes.json, and translations
- Check that configuration defaults are reasonable and documented
- Run the application to do a final test of all features
- Ensure tests pass and TypeScript compilation succeeds
- Remove any demo values or placeholder text that shouldn't be in production

## Example Usage

See `examples/conch-sample-request.md` for a sample feature request that demonstrates how to use this skill.

### Best Practices

- The user conversation may provide context on past work; internalize and reuse it where possible
- Use OpenMRS design system components where possible to ensure consistency
- Keep components small and focused on a single responsibility
- Write clear and concise documentation for your code and features
- Test your code frequently to catch issues early
- Use synthetic data and mocked responses in tests; never include real patient data or credentials
- Verify framework APIs and hooks against the generated package's dependencies before assuming availability
- Follow the naming conventions table to avoid inconsistencies
- Always run dry-run commands first when scaffolding to preview changes
