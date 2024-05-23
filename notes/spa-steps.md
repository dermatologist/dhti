

## Steps

* Dockerfile has RUN mkdir /usr/share/nginx/html/openmrs-esm-genai-1.0.0
* importmap.json:         "@openmrs/esm-genai": "./openmrs-esm-genai-1.0.0/openmrs-esm-genai.js"
* spa-assemble-config.json has         "@openmrs/esm-genai": "1.0.0"
* routes.registry.json:
```
    "@openmrs/esm-genai": {
            "$schema": "https://json.openmrs.org/routes.schema.json",
            "backendDependencies": {
                "webservices.rest": "^2.2.0"
            },
            "extensions": [
                {
                    "component": "genaiLeftPanelLink",
                    "name": "genai-home-left-panel-link",
                    "slot": "homepage-dashboard-slot",
                    "meta": {
                        "name": "genai",
                        "title": "GenAI",
                        "slot": "genai-app-slot"
                    }
                },
                {
                    "component": "root",
                    "name": "genai-root",
                    "slot": "genai-app-slot"
                }
            ]
    }
```
