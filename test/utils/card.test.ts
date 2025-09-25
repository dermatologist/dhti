import {expect} from 'chai'

// ...existing code...
import {CDSHookCard, CDSHookCardLink, CDSHookCardSource} from '../../src/utils/card'

describe('CDSHookCardSource', () => {
  it('should construct with label only', () => {
    const src = new CDSHookCardSource({label: 'CDC'})
    expect(src.label).to.equal('CDC')
    expect(src.url).to.be.undefined
    expect(src.icon).to.be.undefined
  })
  it('should construct with all fields', () => {
    const src = new CDSHookCardSource({icon: 'icon.png', label: 'CDC', url: 'https://cdc'})
    expect(src.label).to.equal('CDC')
    expect(src.url).to.equal('https://cdc')
    expect(src.icon).to.equal('icon.png')
  })
})

describe('CDSHookCardLink', () => {
  it('should construct with label and url', () => {
    const link = new CDSHookCardLink({label: 'View', url: 'https://link'})
    expect(link.label).to.equal('View')
    expect(link.url).to.equal('https://link')
  })
})

describe('CDSHookCard', () => {
  it('should construct with summary only', () => {
    const card = new CDSHookCard({summary: 'Test summary'})
    expect(card.summary).to.equal('Test summary')
    expect(card.detail).to.be.undefined
    expect(card.indicator).to.be.undefined
    expect(card.source).to.be.undefined
    expect(card.links).to.be.undefined
  })

  it('should construct with all fields and nested objects', () => {
    const card = new CDSHookCard({
      detail: 'Details here',
      indicator: 'warning',
      links: [
        {label: 'View Table', url: 'https://table'},
        {label: 'More Info', url: 'https://info'},
      ],
      source: {icon: 'icon.png', label: 'CDC', url: 'https://cdc'},
      summary: 'Risk warning',
    })
    expect(card.summary).to.equal('Risk warning')
    expect(card.detail).to.equal('Details here')
    expect(card.indicator).to.equal('warning')
    expect(card.source).to.be.instanceOf(CDSHookCardSource)
    expect(card.source?.label).to.equal('CDC')
    expect(card.source?.url).to.equal('https://cdc')
    expect(card.source?.icon).to.equal('icon.png')
    expect(card.links).to.have.length(2)
    expect(card.links?.[0]).to.be.instanceOf(CDSHookCardLink)
    expect(card.links?.[0].label).to.equal('View Table')
    expect(card.links?.[1].url).to.equal('https://info')
  })

  it('should build from plain object using from()', () => {
    const obj = {
      indicator: 'info' as const,
      links: [{label: 'Link', url: 'https://l'}],
      source: {label: 'CDC'},
      summary: 'Info',
    }
    const card = CDSHookCard.from(obj)
    expect(card).to.be.instanceOf(CDSHookCard)
    expect(card.indicator).to.equal('info')
    expect(card.source).to.be.instanceOf(CDSHookCardSource)
    expect(card.links?.[0]).to.be.instanceOf(CDSHookCardLink)
  })
})
