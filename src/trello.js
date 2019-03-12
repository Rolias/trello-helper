const Trello = require('trello')
const envCreate = require('env-create')

const getCardPrefixWithId = cardId => `/1/cards/${cardId}`

class TrelloPlus extends Trello {
  constructor(pathString) {
    envCreate.load({path: pathString})
    const trelloAuth = JSON.parse(process.env.trelloHelper)
    super(trelloAuth.appKey, trelloAuth.token)
  }

  getAllActionsOnCard(cardId) {
    const path = `${getCardPrefixWithId(cardId)}/actions`
    const options = {filter: 'all'}
    return this.makeRequest('get', path, options)
  }
}

module.exports = TrelloPlus