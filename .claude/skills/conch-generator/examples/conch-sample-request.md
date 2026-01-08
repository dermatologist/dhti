# Example: Glycemic Control Widget

This example demonstrates how to use the OpenMRS Conch Agent Skill to create a patient-specific widget that integrates GenAI capabilities.

## Feature Request

**Widget Name:** Glycemic Control Advisor

**Purpose:** Display diabetes-related observations with AI-powered interpretations and recommendations.

**Requirements:**

* This widget will be displayed in the patient chart, conditions tab.
* This widget will use `dhti_elixir_glycemic` service to get GenAI outputs, by default. But the user can configure a different DHTI service name via the configuration schema.
* If a patient in context is diabetic (i.e., has a Condition resource with code SNOMED CT 44054006), the widget will display the latest HbA1c and Blood Sugar observations for the patient, along with GenAI interpretations and recommendations from the `dhti_elixir_glycemic` service.

## Expected Workflow

1. **Setup:** The agent will clone the template and name it `openmrs-esm-dhti-glycemic`.

2. **Code Adaptation:** 
   - Replace "template" with "glycemic" throughout the codebase.
   - Update `index.ts` to set `moduleName` to `@openmrs/esm-glycemic` and `featureName` to `dhti-glycemic`.
   - Rename `root.*` files to `glycemic-widget.*`.
   - Update `config-schema.ts` to include configuration for the DHTI service name.

3. **Component Implementation:**
   - Create a component that checks if the patient has diabetes (SNOMED CT 44054006).
   - Fetch latest HbA1c and Blood Sugar observations.
   - Call the DHTI service using `useDhti.ts` hook with the configured service name.
   - Display observations and AI-generated interpretations.

4. **Route Configuration:**
   - Update `routes.json` to register the widget as an extension in the patient chart conditions tab.

5. **Testing:**
   - Write tests to verify the component renders correctly.
   - Test the diabetes condition check.
   - Test the observation fetching logic.
   - Test the DHTI service integration.

## How to Invoke This Skill

When working with an AI coding assistant that supports this skill:

```
I need to create a new OpenMRS microfrontend using the DHTI template. 
Here's my feature request:

[Paste the requirements above]

Please use the OpenMRS Conch Agent Skill to scaffold and implement this feature.
```

## Expected Output

The agent should:
1. Clone the template
2. Perform all necessary renames and cleanups
3. Implement the glycemic control widget
4. Configure the DHTI service integration
5. Write appropriate tests
6. Update documentation

## Configuration Example

The resulting `config-schema.ts` should include:

```typescript
export const configSchema = {
  dhtiServiceName: {
    _type: Type.String,
    _default: 'dhti_elixir_glycemic',
    _description: 'The name of the DHTI service to use for glycemic control advice',
  },
  // Other configuration options...
};
```

## Notes

- The widget should gracefully handle cases where the patient is not diabetic.
- Error handling should be implemented for DHTI service calls.
- The UI should follow OpenMRS Carbon Design System patterns.
- All text should be internationalized using the translations system.
