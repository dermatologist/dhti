import {CDSHookCard} from './card.js'

const cards = (response: any) => {
  const _cards = response?.data?.cards
  if (Array.isArray(_cards) && _cards.length > 0) {
    const lastCard = _cards.at(-1)
    const card = new CDSHookCard(lastCard)
    return [card]
  }
 
    return [new CDSHookCard()]
  
}

export default cards