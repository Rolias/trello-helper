// @ts-check
/** @module */
const Trello = require('trello')
const envCreate = require('env-create')
const logger = require('./util/logger')

/**
 * @extends Trello
 */
class TrelloPlus extends Trello {
  /**
   * Create the TrelloPLus class to add more trello functions
   * @param {string} pathString path to the trello JSON credentials file
   */
  constructor(pathString) {
    const result = envCreate.load({path: pathString})
    if (result.status === false) {
      logger.error(`FATAL ERROR reading credentials. ${JSON.stringify(result, null, 2)}`)
    }
    const trelloAuth = JSON.parse(process.env.trelloHelper)
    super(trelloAuth.appKey, trelloAuth.token)
  }
  /** @return the '/1/cards'   DRY */
  getBaseCardCmd() {return '/1/cards'}
  getCardPrefixWithId(cardId) {return `${this.getBaseCardCmd()}/${cardId}`}
  getListPrefixWithId(listId) {return `/1/list/${listId}`}
  getListCardCmd(listId) {return `${this.getListPrefixWithId(listId)}/cards`}
  getBoardPrefixWithId(boardId) {return `1/board/${boardId}`}

  /**
 * Wrap the underlying makeRequest for get
 * @param {string} path 
 * @param {Object} options  
 * @return {Promise<Object>}
 * @example get(this.getListCardCmd('123'), {limit:10})
 */
  get(path, options) {
    return this.makeRequest('get', path, options)
  }
  /** wrap the underlying makeRequest for put @see get()   */
  put(path, options) {
    return this.makeRequest('put', path, options)
  }
  /** wrap the underlying makeRequest for post */
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
   * @param {{fromId:string, withOptions}} listParam 
    * @returns {Promise<Array<Object<string,any>>>} a Promise of an array of card objects
   * @example getCardsOnListWith({id:'123',options:{limit:10}})
   */
  getCardsOnList(listParam) {
    const path = `${this.getListCardCmd(listParam.fromId)}`
    const {withOptions} = listParam
    return this.get(path, withOptions)
  }
  /**
   * Get all cards that are archived for the specified list
   * @param {{forBoardId,onListId}} param 
   * @returns {Promise<Array.<Object>>} returns Promise to array of cards
   * @example getArchivedCards({forBoardId:'123',onListId'456'})
   */
  async getArchivedCards(param) {
    const options = {filter: 'closed'}
    const list = param.onListId
    const archivedCards = await this.getCardsOnBoardWithExtraParams(param.forBoardId, options)
    const archivedOnList = archivedCards.filter(e => e.idList === list)
    return archivedOnList
  }
  /**
   * Find actions that indicate card was previously on the specified list name
   * @param {Array.<Object>} actions 
   * @param {string} listName  name that card was on before
   * @return {Array<Object>} the array of actions that fit the criteria
   */
  wasOnList(actions, listName) {
    return actions.filter(e => e.data.listBefore === listName)
  }

  /**
   * Find any actions that are of type 'moveCardToBoard' and capture
   * the number found and the date of the first one found
   * @param {Array.<Object>} actions the action objects 
   * @returns {{status:number,date:any}} object withe status and date properties status 
   * will have count of number of actions found. Date has date of first object found
   * @example getMoveCardToBoardInfo([{actionObjects}])
   */
  getMoveCardToBoardInfo(actions) {
    const result = actions.filter(e => e.type === 'moveCardToBoard')
    const moveInfo = {status: result.length, date: ''}
    if (result.length > 0) {
      moveInfo.date = result[0].date
    }
    return moveInfo
  }

  /**
   * Set the due date as complete when isComplete:true or clear it if 
   * isComplete:false
   * @param {{id,isComplete:boolean}} param 
   * @returns {Promise<Object<string,any>>} a Promise of a card object
   * @example setDueComplete({id:'123', isComplete:true})
   */
  setDueComplete(param) {
    const cmd = this.getCardPrefixWithId(param.id)
    const options = {dueComplete: param.isComplete}
    return this.put(cmd, options)
  }
  /**
   * Add the card to the specified list. Use name and optional description
   * @param {{name:string, description:string, idList:string}} param 
   * @returns {Promise<Object<string,any>>} a Promise of a card object
   * @example addCard({name:'my name',description:'test',idList:'12345"})
   */
  addCard(param) {
    return this.post(this.getBaseCardCmd(), param)
  }

  addCommentOnCard(param) {
    const cmd = getCardPrefixWithId(param.id) + '/actions/comments'
    return post(cmd, param.options)
    return super.addCommentToCard(param.id, param.text)
  }
}

module.exports = TrelloPlus