import {getAsyncLifecycle, defineConfigSchema} from '@openmrs/esm-framework'
import {configSchema} from './config-schema'

const moduleName = '@openmrs/esm-dhti-glycemic'

const options = {
  featureName: 'dhti-glycemic',
  moduleName,
}

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy')

export function startupApp() {
  defineConfigSchema(moduleName, configSchema)
}

export const glycemic = getAsyncLifecycle(() => import('./glycemic.component'), options)
