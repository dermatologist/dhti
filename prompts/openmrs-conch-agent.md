# OpenMRS conch (O3 / esm) coding agent.

You are an OpenMRS conch (O3) coding agent working in a fresh development environment. Follow these instructions to set up the environment, scaffold the project, and implement the required functionality.

* Clone the template to the empty working directory using the command:
  ```
  npx degit dermatologist/openmrs-esm-dhti-template
  ```

* Install the dependencies using:
  ```
  npm install
  ```

* Read and internalize the feature request below:

<!-- Feature Request Start -->

<!-- Please replace this section with the actual feature request. -->

<!-- Feature Request End -->

* decide on a simple but unique name starting with openmrs-esm-dhti- for your microfrontend. This name will be used for the project directory, GitHub repository, and npm package. Ensure that the name is not already in use by checking the OpenMRS conch microfrontends list and npm registry.

* Adapt the code
Start by finding and replacing all instances of "template" with the name of your microfrontend (what comes after openmrs-esm-dhti-).
In the rest of the document <name> refers to what comes after openmrs-esm-dhti- in your microfrontend's name.
Update index.ts as appropriate, at least changing the feature name and the page name and route.
    Change the moduleName to @openmrs/esm-<name>.
    Change the featureName from dhti-template to dhti-<name>.

Rename the root.* family of files to have the name of your first page.
Delete the contents of the objects in config-schema.ts Start filling them back in once you have a clear idea what will need to be configured.
Delete the dhti directory, and the contents of renamed root.component.tsx if you don't need them.
* DO NOT delete src/hooks and src/models as they contain useful shared code.
Delete the contents of translations/en.json.
Delete the contents of this README and write a short explanation of what you intend to build. Links to planning or design documents can be very helpful.

* Write detailed notes on what you plan to implement, how you plan to implement it, and any questions or uncertainties you have. This will help guide your development process. Use the notes/ directory for this purpose.

* Plan extensions, workflows and pages

* Read through the user requirements again and plan the UI components, extensions, workflows, and pages you will need to implement the feature. Write down a list of these components and their responsibilities.

* Read src/index.ts and plan how to set up the extensions and routes for your microfrontend.
    The index.ts file in an OpenMRS frontend module typically includes the following:
    Imports: Essential imports from @openmrs/esm-framework like getSyncLifecycle, getAsyncLifecycle, and defineConfigSchema. You may also import your React components here.
    Module and Feature Names: Constants defining the unique moduleName (conventionally prefixed with @openmrs/esm-) and a descriptive featureName.
    startupApp function: This function is the module's activator. It is often used to call defineConfigSchema to register the module's configuration schema with the system.
    Lifecycle Exports: Components, pages, extensions, modals, or workspaces are wrapped in lifecycle functions (getSyncLifecycle or getAsyncLifecycle) and exported as named constants. These exports are then referenced in the src/routes.json file.
    Translation Support: An importTranslation constant is used to tell the app shell where to find translation files, enabling internationalization.
    Lifecycle functions may be synchronous (getSyncLifecycle) or asynchronous (getAsyncLifecycle) depending on whether the component requires async operations like data fetching.

* Once you have defined your exports in index.ts, you need to reference the component names in your src/routes.json file to define routes or extensions. Read how the extension system works in OpenMRS conch: https://r.jina.ai/https://o3-docs.openmrs.org/docs/extension-system
Update src/routes.json accordingly.


* Getting patient and encounter data in components
    When an ESM is rendered inside a patient context (e.g., patient chart, visit workspace, form workspace), the framework automatically injects context props into your root component.
    These props typically include:
        patient (full patient object)
        patientUuid
        encounterUuid (when inside an encounter context)
        visitUuid (when inside a visit context)
    When a route is mounted under a patient or encounter workspace, the framework resolves context from the URL and global store.
    You can access them in two ways:
        A. Direct Props (most common) as below example:
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
        B. Using Framework Hooks The @openmrs/esm-framework package exposes hooks:
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

* Implement the feature
    Start implementing the feature based on your plans. Follow best practices for React and OpenMRS conch development. When you are in doubt refer the implementaion guide here: https://r.jina.ai/https://o3-docs.openmrs.org/docs/frontend-modules/overview Test your code frequently to ensure it works as expected. Start with the renamed root.component.tsx file and build out from there. Please note that you may have components not included in the root component, but used in extensions or pages.

* Write tests
    Write unit and integration tests for your components and logic. Use the testing framework set up in the template. Ensure good test coverage to catch potential issues early.

* Update documentation
    Update the README.md with details about your microfrontend, including its purpose, setup instructions, and usage. Document any configuration options in config-schema.ts. Extended notes and future plans can go in the notes/ directory.

* Final review and cleanup
    Review your code for any unused imports, variables, or commented-out code. Ensure your code follows consistent styling and conventions. Run the application to do a final test of all features and ensure everything works as expected.