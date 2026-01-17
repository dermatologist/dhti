import useSWR from 'swr'
import {fhirBaseUrl, openmrsFetch} from '@openmrs/esm-framework'

/**
 * This hook searches for a patient using the provided search term from the
 * OpenMRS FHIR API. It leverages the useSWR hook from the SWR library
 * https://swr.vercel.app/docs/data-fetching to fetch data. SWR provides a
 * number of benefits over the standard React useEffect hook, including:
 *
 * - Fast, lightweight and reusable data fetching
 * - Built-in cache and request deduplication
 * - Real-time updates
 * - Simplified error and loading state handling, and more.
 *
 *  We recommend using SWR for data fetching in your OpenMRS frontend modules.
 *
 * See the docs for the underlying fhir.js Client object: https://github.com/FHIR/fhir.js#api
 * See the OpenMRS FHIR Module docs: https://wiki.openmrs.org/display/projects/OpenMRS+FHIR+Module
 * See the OpenMRS REST API docs: https://rest.openmrs.org/#openmrs-rest-api
 *
 * @param query A patient name or ID
 * @returns The first matching patient
 */

export function usePatient(query: string) {
  // If query has a number anywhere in it, treat it as an identifier search
  const isId = /\d/.test(query)
  let url = null
  if (query && query.trim()) {
    if (isId) {
      url = `${fhirBaseUrl}/Patient?identifier=${encodeURIComponent(query.trim())}&_summary=data`
    } else {
      url = `${fhirBaseUrl}/Patient?name=${encodeURIComponent(query.trim())}&_summary=data`
    }
  }
  const {data, error, isLoading} = useSWR<any, Error>(url, openmrsFetch)

  let patient = null
  // * Use the code below to handle direct ID searches, if needed in future
  // --- IGNORE ---
  // if (isId) {
  //   // FHIR /Patient/{id} returns the patient directly
  //   if (data && data.resourceType === 'Patient') {
  //     patient = data;
  //   }
  // } else {
  //   if (data && data.data && Array.isArray(data.data.entry) && data.data.entry.length > 0) {
  //     patient = data.data.entry[0].resource;
  //   }
  // }

  if (data && data.data && Array.isArray(data.data.entry) && data.data.entry.length > 0) {
    patient = data.data.entry[0].resource
  }

  return {
    patient,
    error: error,
    isLoading,
  }
}
