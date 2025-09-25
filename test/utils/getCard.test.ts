import {expect} from 'chai'

import {CDSHookCard} from '../../src/utils/card'
import cards from '../../src/utils/getCard'

describe('getCard', () => {
  it('returns last card when cards exist', () => {
    const cardObj1 = {summary: 'Card 1'}
    const cardObj2 = {detail: 'Details', summary: 'Card 2'}
    const response = {data: {cards: [cardObj1, cardObj2]}}
    const result = cards(response)
    expect(result).to.have.length(1)
    expect(result[0]).to.be.instanceOf(CDSHookCard)
    expect(result[0].summary).to.equal('Card 2')
    expect(result[0].detail).to.equal('Details')
  })

  it('returns default card when cards is empty', () => {
    const response = {data: {cards: []}}
    const result = cards(response)
    expect(result).to.have.length(1)
    expect(result[0]).to.be.instanceOf(CDSHookCard)
    expect(result[0].summary).to.be.undefined
  })

  it('returns default card when cards is missing', () => {
    const response = {data: {}}
    const result = cards(response)
    expect(result).to.have.length(1)
    expect(result[0]).to.be.instanceOf(CDSHookCard)
    expect(result[0].summary).to.be.undefined
  })

  it('returns default card when response is undefined', () => {
    const result = cards()
    expect(result).to.have.length(1)
    expect(result[0]).to.be.instanceOf(CDSHookCard)
    expect(result[0].summary).to.be.undefined
  })
})
