import {CDSHookCard} from './card'

const cards = (response: any) => {
  const _cards = response?.data?.cards
  if (Array.isArray(_cards) && _cards.length > 0) {
    const lastCard = _cards[_cards.length - 1]
    const card = new CDSHookCard(lastCard)
    return [card]
  } else {
    return [new CDSHookCard()]
  }
}

export default cards