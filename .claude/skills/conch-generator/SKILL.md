# OpenMRS Conch Agent Skill

This skill helps you generate a new OpenMRS ESM microfrontend (conch) from this template. Use this skill when you need to create a new DHTI-enabled microfrontend that integrates with the OpenMRS 3.x ecosystem.

## Skill Purpose

DHTI is a platform to rapidly prototype, share, and test GenAI healthcare applications within an EHR. This skill guides you through:
- Setting up a development environment
- Scaffolding a new microfrontend project
- Implementing GenAI-powered features based on requirements

## When to Use This Skill

Use this skill when you need to:
- Create a new OpenMRS ESM microfrontend from this template
- Build a DHTI-enabled healthcare application
- Integrate GenAI capabilities into an OpenMRS microfrontend
- Develop patient-context-aware UI components for OpenMRS

## Instructions

### Environment Setup and Project Scaffolding

1. **Clone the template to the empty working directory:**
   ```bash
   npx degit dermatologist/openmrs-esm-dhti-template openmrs-esm-dhti-<name>
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Read and internalize the GenAI feature request below:**

   <!-- Feature Request Start -->
   <!-- Please replace this section with the actual feature request. see examples/conch-sample-request.md -->
   [Please replace this section with the actual feature request. See examples/conch-sample-request.md]
   <!-- Feature Request End -->

4. **Decide on a simple but unique name** starting with `openmrs-esm-dhti-` for your microfrontend. This name will be used for the project directory, GitHub repository, and npm package. Ensure that the name is not already in use by checking the OpenMRS microfrontends list and npm registry.

### Code Adaptation and Initial Cleanup

5. **Adapt the code:**
   - Find and replace all instances of "template" with the name of your microfrontend (what comes after `openmrs-esm-dhti-`).
   - In the rest of this document `<name>` refers to what comes after `openmrs-esm-dhti-` in your microfrontend's name.
   - Update `index.ts` as below:
     - Change the `moduleName` to `@openmrs/esm-<name>`.
     - Change the `featureName` from `dhti-template` to `dhti-<name>`.
   - Rename the `root.*` family of files to have the name of your first page.
   - Delete the contents of the objects in `config-schema.ts`. Start filling them back in once you have a clear idea what will need to be configured.
   - Delete the `dhti` directory, and the contents of renamed `root.component.tsx` if you don't need them.
   - **DO NOT** delete `src/hooks` and `src/models` as they contain useful shared code.
   - Delete the contents of `translations/en.json`.
   - Delete the contents of this README and write a short explanation of what you intend to build. Links to planning or design documents can be very helpful.

### Planning and Notes

6. **Write detailed notes** on what you plan to implement, how you plan to implement it, and any questions or uncertainties you have. This will help guide your development process. Use the `notes/` directory for this purpose.

7. **Plan UI components, extensions, workflows, and pages:**
   - Read through the user requirements above again and plan the UI components, extensions, workflows, and pages you will need to implement the feature.
   - Write down a list of these components and their responsibilities in `notes/plan.md` for future reference.

### Routing and Extension Setup

8. **Read `src/index.ts` again, and plan how to set up the extensions and routes for your microfrontend.**
   - The `index.ts` file in an OpenMRS frontend module typically includes the following:
     - **Imports:** Essential imports from `@openmrs/esm-framework` like `getSyncLifecycle`, `getAsyncLifecycle`, and `defineConfigSchema`. You may also import your React components here.
     - **Module and Feature Names:** Constants defining the unique `moduleName` (conventionally prefixed with `@openmrs/esm-`) and a descriptive `featureName`. You updated this before.
     - **startupApp function:** This function is the module's activator. It is often used to call `defineConfigSchema` to register the module's configuration schema with the system.
     - **Lifecycle Exports:** Components, pages, extensions, modals, or workspaces are wrapped in lifecycle functions (`getSyncLifecycle` or `getAsyncLifecycle`) and exported as named constants. These exports are then referenced in the `src/routes.json` file.
     - **Translation Support:** An `importTranslation` constant is used to tell the app shell where to find translation files, enabling internationalization.
     - Lifecycle functions may be synchronous (`getSyncLifecycle`) or asynchronous (`getAsyncLifecycle`) depending on whether the component requires async operations like data fetching.

9. **Reference the component names in your `src/routes.json` file** to define routes or extensions. Read how the extension system works in OpenMRS micro-frontend: <https://o3-docs.openmrs.org/docs/extension-system>. Update `src/routes.json` accordingly.

### Patient and Encounter Data in Components

10. **Getting patient and encounter data in components:**
    - When an ESM is rendered inside a patient context (e.g., patient chart, visit workspace, form workspace), the framework automatically injects context props into your root component.
    - These props typically include:
      - `patient` (full patient object)
      - `patientUuid`
      - `encounterUuid` (when inside an encounter context)
      - `visitUuid` (when inside a visit context)
    - When a route is mounted under a patient or encounter workspace, the framework resolves context from the URL and global store.
    - You can access them in two ways:
      - **A. Direct Props (most common):**
        ```tsx
        export default function MyComponent({ patientUuid, encounterUuid }) {
            return (
                <div>
                    Patient: {patientUuid}
                    Encounter: {encounterUuid}
                </div>
            );
        }
        ```
      - **B. Using Framework Hooks:**
        ```tsx
        import { usePatient, useVisit, useEncounter } from "@openmrs/esm-framework";

        const MyComponent = () => {
            const patient = usePatient();
            const encounter = useEncounter();

            console.log(patient?.uuid);
            console.log(encounter?.uuid);

            return <div>...</div>;
        };
        ```

### GenAI Outputs

11. **Getting GenAI outputs:**
    - Use the `src/hooks/useDhti.ts` to call the DHTI service and get GenAI outputs. Read the code and comments in the file to understand how to use it. You need to provide the DHTI service name. If the user has not provided it above, ask for it using a prompt.

### Implementation

12. **Implement the feature:**
    - Start implementing the feature based on your plans. Follow best practices for React and OpenMRS frontend-module development. When you are in doubt refer to the implementation guide here: <https://o3-docs.openmrs.org/docs/frontend-modules/overview>. Test your code frequently to ensure it works as expected. Start with the renamed `root.component.tsx` file and build out from there. Please note that you may have components not included in the root component, but used in extensions or pages.

### Testing

13. **Write tests:**
    - Write unit and integration tests for your components and logic. Use the testing framework set up in the template. Ensure good test coverage to catch potential issues early.

### Documentation

14. **Update documentation:**
    - Update the `README.md` with details about your microfrontend, including its purpose, setup instructions, and usage. Document any configuration options in `config-schema.ts`. Extended notes and future plans can go in the `notes/` directory.

### Final Review and Cleanup

15. **Final review and cleanup:**
    - Review your code for any unused imports, variables, or commented-out code. Ensure your code follows consistent styling and conventions. Run the application to do a final test of all features and ensure everything works as expected.

## Example Usage

See `examples/conch-sample-request.md` for a sample feature request that demonstrates how to use this skill.

## Additional Resources

- [OpenMRS Frontend Modules Overview](https://o3-docs.openmrs.org/docs/frontend-modules/overview)
- [OpenMRS Extension System](https://o3-docs.openmrs.org/docs/extension-system)
- [DHTI GitHub Repository](https://github.com/dermatologist/dhti)
