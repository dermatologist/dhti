/**
 * TypeScript models for CDS Hook Card
 *
 * Example:
 * {
 *   "summary": "Patient is at high risk for opioid overdose.",
 *   "detail": "According to CDC guidelines, the patient's opioid dosage should be tapered to less than 50 MME. [Link to CDC Guideline](https://www.cdc.gov/drugoverdose/prescribing/guidelines.html)",
 *   "indicator": "warning",
 *   "source": {
 *     "label": "CDC Opioid Prescribing Guidelines",
 *     "url": "https://www.cdc.gov/drugoverdose/prescribing/guidelines.html",
 *     "icon": "https://example.org/img/cdc-icon.png"
 *   },
 *   "links": [
 *     {
 *       "label": "View MME Conversion Table",
 *       "url": "https://www.cdc.gov/drugoverdose/prescribing/mme.html"
 *     }
 *   ]
 * }
 */

/**
 * The allowed indicators for a CDS Hook Card.
 * Mirrors: Literal["info", "warning", "hard-stop"]
 */
export type CDSHookCardIndicator = 'info' | 'warning' | 'hard-stop'

/**
 * Source of the CDS Hook Card
 */
export class CDSHookCardSource {
  label!: string
  url?: string
  icon?: string

  constructor(init?: Partial<CDSHookCardSource>) {
    Object.assign(this, init)
  }
}

/**
 * Link associated with the CDS Hook Card
 */
export class CDSHookCardLink {
  label!: string
  url!: string

  constructor(init?: Partial<CDSHookCardLink>) {
    Object.assign(this, init)
  }
}

/**
 * CDS Hook Card Model
 */
export class CDSHookCard {
  summary!: string
  detail?: string
  indicator?: CDSHookCardIndicator
  source?: CDSHookCardSource
  links?: CDSHookCardLink[]

  constructor(init?: Partial<CDSHookCard>) {
    if (init) {
      // Shallow assign for primitives; nested objects handled below if present
      const {source, links, ...rest} = init as CDSHookCard
      Object.assign(this, rest)
      if (source) this.source = new CDSHookCardSource(source)
      if (links) this.links = links.map((l) => new CDSHookCardLink(l))
    }
  }

  /**
   * Factory to build a CDSHookCard from a plain object, ensuring nested types are instantiated.
   */
  static from(obj: Partial<CDSHookCard>): CDSHookCard {
    return new CDSHookCard(obj)
  }
}
