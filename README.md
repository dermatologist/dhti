# dhti

<p align="center">
  <img src="https://github.com/dermatologist/dhti/blob/main/notes/dhti.jpg" />
</p>

## Description


## Resources

* [langserve-launch-example](https://github.com/langchain-ai/langserve-launch-example)
* http://localhost:8005/hapi-fhir-jpaserver/fhir/

## Running frontend module locally

* npx openmrs start --backend "https://emr-v2.test.icrc.org/" --add-cookie "MRHSession=1234..."
* https://o3-docs.openmrs.org/docs/frontend-modules/development
* yarn start --sources packages/esm-form-engine-app  --port 8090 --importmap https://dev3.openmrs.org/openmrs/spa/importmap.json

"resolutions": {
  "@openmrs/openmrs-form-engine-lib": "portal:/Users/johndoe/code/openmrs-form-engine-lib"
}


Generate distribution (using survey or config mode) - DEV
1. Build the frontend app
npx openmrs build
npx --legacy-peer-deps openmrs@next build --target dist --fresh (if conflicts or errors)
2. Assemble frontend module (define spa path in spa-build-config.json)
define needed frontend modules in spa-build-config.json
npx openmrs assemble --mode config --config spa-build-config.json
3. mount dist as a volume (in docker-compose)
- ./frontend/dist/:/usr/share/nginx/html/
4. commit and tag docker container (optional)


## index.html
initializeSpa({
        apiUrl: "$API_URL",
        spaPath: "$SPA_PATH",
        env: "production",
        offline: false,
        configUrls: ["$SPA_CONFIG_URLS"],


## Vector database

- Milvus