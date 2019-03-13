/** @module */
const Trello = require('trello')
const envCreate = require('env-create')

const getCardPrefixWithId = cardId => `/1/cards/${cardId}`
const getListPrefixWithId = listId => `/1/list/${listId}`
const getListCardCmd = listId => `${getListPrefixWithId(listId)}/cards`
const getBoardPrefixWithId = boardId => `1/board/${boardId}`
const getBoardCardCmd = boardId => `${getBoardPrefixWithId(boardId)}/cards/closed`


/**   @class */
class TrelloPlus extends Trello {
  constructor(pathString) {
    envCreate.load({path: pathString})
    const trelloAuth = JSON.parse(process.env.trelloHelper)
    super(trelloAuth.appKey, trelloAuth.token)
  }

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
    const path = `${getCardPrefixWithId(cardId)}/actions`
    const options = {filter: 'all'}
    return this.get(path, options)
  }

  /**
   * Get all archived cards from the board that match the passed list id
   * @param {{id, options}} listParam 
   * @returns {Promise<Array.<{}}>>}
   * @example 
   */
  getCardsOnListWith(listParam) {
    const path = `${getListCardCmd(listParam.id)}`
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
}

module.exports = TrelloPlus