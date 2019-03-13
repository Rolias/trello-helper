// @ts-check
/** @module */
const Trello = require('trello')
const envCreate = require('env-create')

/**   @class */
class TrelloPlus extends Trello {
  constructor(pathString) {
    envCreate.load({path: pathString})
    const trelloAuth = JSON.parse(process.env.trelloHelper)
    super(trelloAuth.appKey, trelloAuth.token)
  }
  getBaseCardCmd() {return '/1/cards'}
  getCardPrefixWithId(cardId) {return `${this.getBaseCardCmd()}/${cardId}`}
  getListPrefixWithId(listId) {return `/1/list/${listId}`}
  getListCardCmd(listId) {return `${this.getListPrefixWithId(listId)}/cards`}
  getBoardPrefixWithId(boardId) {return `1/board/${boardId}`}


  get(path, options) {
    return this.makeRequest('get', path, options)
  }

  put(path, options) {
    return this.makeRequest('put', path, options)
  }

  post(path, options) {
    return this.makeRequest('post', path, options)
  }


  /** Get all the actions on the card
   * @param {string} cardId
   */
  getAllActionsOnCard(cardId) {
    const path = `${this.getCardPrefixWithId(cardId)}/actions`
    const options = {filter: 'all'}
    return this.get(path, options)
  }

  /**
   * Get all archived cards from the board that match the passed list id
   * @param {{id:string, options}} listParam 
   * @returns {Promise<Array.<{}>>}>>}
   * @example 
   */
  getCardsOnListWith(listParam) {
    const path = `${this.getListCardCmd(listParam.id)}`
    const {options} = listParam
    return this.get(path, options)
  }
  /**
   * 
   * @param {{forBoardId,onListId}} param 
   */
  async getArchivedCards(param) {
    const options = {filter: 'closed'}
    const list = param.onListId
    const archivedCards = await this.getCardsOnBoardWithExtraParams(param.forBoardId, options)
    const archivedOnList = archivedCards.filter(e => e.idList === list)
    return archivedOnList
  }

  wasOnList(actions, listName) {
    return actions.filter(e => e.data.listBefore === listName)
  }

  getMoveCardToBoardInfo(actions) {
    const result = actions.filter(e => e.type === 'moveCardToBoard')
    const moveInfo = {status: result.length, date: ''}
    if (result.length > 0) {
      moveInfo.date = result[0].date
    }
    return moveInfo
  }

  /**
   * @param {{id,isComplete:boolean}} params
   */
  setDueComplete(params) {
    const cmd = this.getCardPrefixWithId(params.id)
    const options = {dueComplete: params.isComplete}
    return this.put(cmd, options)
  }
  /**
   * Add the card to the specified list. Use name and optional description
   * @param {{name:string, description:string, idList:string}} param 
   * @return {Promise<{}>} resolves to card created
   * @example addCard({name:'my name',description:'test',idList:'12345"})
   */
  addCard(param) {
    return this.post(this.getBaseCardCmd(), param)
  }
}

module.exports = TrelloPlus