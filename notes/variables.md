Next, we'll need to wire up the Patient lists link extension to the left panel. To do this, we'll need to add the following extension definition to the Patient Lists app routes.json file:

{
  "$schema": "https://json.openmrs.org/routes.schema.json",
  "backendDependencies": {
    "webservices.rest": "^2.2.0"
  },
  "extensions": [
    {
      "component": "patientListLeftPanelLink",
      "name": "patient-lists-home-left-panel-link",
      "slot": "homepage-dashboard-slot",
      "meta": {
        "name": "patient-lists",
        "title": "Patient lists",
        "slot": "patient-lists-app-slot"
      }
    },
    {
      "component": "root",
      "name": "patient-lists-root",
      "slot": "patient-lists-app-slot"
    }
    // ...
  ]
}

Some things to note:

The component property is set to patientListLeftPanelLink, which is the named export that we defined in the previous step.

The name property is set to patient-lists-left-panel-link, which is the name of the extension.

The slot property is set to homepage-dashboard-slot, which is the name of the slot that we want to add the extension to. This slot is where the links that are displayed on the left panel of the O3 home page are rendered.

The meta property is set to the object that we passed to createLeftPanelLink the previous step. This object contains the name, slot, and title properties that are required by the patientListLeftPanelLink component.

The name property is set to patient-lists, which is the name of the app.
The slot property is set to patient-lists-dashboard-slot, which is the name of the slot that we want to add the extension to. This slot is where the links that are displayed on the left panel of the Patient Lists app landing screen are rendered.