/**
 * CDS Hook Request Model (TypeScript)
 *
 * Example:
 * {
 *   "hookInstance": "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
 *   "fhirServer": "https://example.com/fhir",
 *   "fhirAuthorization": { ... },
 *   "hook": "patient-view",
 *   "context": { ... },
 *   "prefetch": { ... }
 * }
 */

export class CDSHookRequest {
  /** A unique identifier for this hook invocation */
  hookInstance?: string

  /** Base URL of the FHIR server associated with the hook */
  fhirServer?: string

  /** Authorization details (opaque to this model) */
  fhirAuthorization?: Record<string, any> | null

  /** Name of the hook (e.g., "patient-view", "order-select", etc.) */
  hook?: string

  /** Context object passed by the EHR */
  context?: Record<string, any> | null

  /** Prefetched FHIR resources keyed by name */
  prefetch?: Record<string, any> | null

  constructor(init?: Partial<CDSHookRequest>) {
    Object.assign(this, init)
  }

  /** Factory to build a CDSHookRequest from a plain object. */
  static from(obj: Partial<CDSHookRequest>): CDSHookRequest {
    return new CDSHookRequest(obj)
  }
}
