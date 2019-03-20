// @ts-check
/** @module */
const Trello = require('trello')
const envCreate = require('env-create')
const logger = require('./util/logger')
const moment = require('moment')

/**
 * @extends Trello
 */
class TrelloPlus extends Trello {
  /**
   * Create the TrelloPLus class to add more trello functions
   * @param {string=} pathString path to the trello JSON credentials file
   */
  constructor(pathString) {
    const param = {}
    if (pathString !== undefined) {
      param.path = pathString
    }
    const result = envCreate.load(param)
    if (result.status === false) {
      const errorMsg = `FATAL ERROR reading credentials. ${JSON.stringify(result, null, 2)}`
      logger.error(errorMsg)
      throw (errorMsg)
    }
    const trelloAuth = JSON.parse(process.env.trelloHelper)
    super(trelloAuth.appKey, trelloAuth.token)
  }
  /** @return '/1/cards'  */
  getBaseCardCmd() {return '/1/cards'}
  getCardDueCmd(cardId) {return `${this.getCardPrefixWithId(cardId)}/due`}
  getCardPrefixWithId(cardId) {return `${this.getBaseCardCmd()}/${cardId}`}
  getListPrefixWithId(listId) {return `/1/list/${listId}`}
  getListCardCmd(listId) {return `${this.getListPrefixWithId(listId)}/cards`}
  getBoardPrefixWithId(boardId) {return `/1/board/${boardId}`}

  /**
 * Wrap the underlying makeRequest for get
 * @param {string} path 
 * @param {Object} options  
 * @return {Promise<any>}
 * @example get(this.getListCardCmd('123'), {limit:10})
 */
  get(path, options) {
    return this.makeRequest('get', path, options)
  }
  /** wrap the underlying makeRequest for put 
   * @param {string} path 
   * @param {Object} options  
   * @return {Promise<any>}
   * @example  put(getCardPrefixWithId(<cardId>), {dueComplete: true})
   */
  put(path, options) {
    return this.makeRequest('put', path, options)
  }

  /**
  * Wrap the underlying makeRequest for post
  * @param {string} path 
  * @param {Object} options  
  * @return {Promise<any>}
  * @example post(this.getBaseCardCmd(), {name:'card name', description:'some desc., idList:<idOfList>})
  */
  post(path, options) {
    return this.makeRequest('post', path, options)
  }

  /** Get all the actions on the card
   * @param {string} cardId
   * @returns {Promise<Array.<Object<string,any>>>}
   */
  getAllActionsOnCard(cardId) {
    const path = `${this.getCardPrefixWithId(cardId)}/actions`
    const options = {filter: 'all'}
    return this.get(path, options)
  }

  /**
   * Get all archived cards from the board that match the passed list id
   * @param {{id:string, options=}} listParam  
   * @returns {Promise<Array<Object<string,any>>>} a Promise of an array of card objects
   * @example getCardsOnListWith({id:'123',options:{limit:11}})
   */
  getCardsOnList(listParam) {
    const path = `${this.getListCardCmd(listParam.id)}`
    const {options} = listParam
    return this.get(path, options)
  }
  /**
   * Get all cards that are archived for the specified list
   * @param {{boardId,listId}} param 
   * @returns {Promise<Array.<Object>>} returns Promise to array of cards
   * @example getArchivedCards({boardId:'123',listId'456'})
   */
  async getArchivedCards(param) {
    const options = {filter: 'closed'}
    const list = param.listId
    const path = `${this.getBoardPrefixWithId(param.boardId)}/cards`
    const archivedCards = await this.get(path, options)
    const archivedOnList = archivedCards.filter(e => e.idList === list)
    return archivedOnList
  }
  /**
   * Find actions that indicate card was previously on the specified list name
   * @param {{actions,filterList}} params 
   * @return {Array<Object>} the array of actions that fit the criteria
   * @example actionWasOnList({actions,filterList:'idOfList'})
   */
  actionWasOnList(params) {
    return params.actions.filter(e => e.data.listBefore === params.filterList)
  }
  /**
   * Find actions in array whose `type` field matches the passed type property
   * @param {{actions:Array,filterType:string }} param 
   * @returns {Array<Object<string,any>>} - array of matching actions
   * @usage filterActionsByType({actions:[], type:'updateCard'})
   */
  filterActionsByType(param) {
    return param.actions.filter(e => e.type === param.filterType)
  }

  /**
   * Find any actions that are of type 'moveCardToBoard' and capture
   * the number found and the date of the first one found
   * @param {Array.<Object<string,any>>} actions the action objects 
   * @returns {Array.<Object<string,any>>} array of actions of the moveCardToBoardType 
   * will have count of number of actions found. Date has date of first object found
   * @example getMoveCardToBoardInfo([{actionObjects}])
   */
  getMoveCardToBoardActions(actions) {
    return this.filterActionsByType({actions, filterType: 'moveCardToBoard'})
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

  /**
   * Add a comment to the card
   * @param {{id,text}} param id of the card and text for the comment
   * @returns {Promise<Object<string,any>>} a Promise of a card object
   * @example addCommentOnCard({id:'123',text:"message for comment"})
   */
  addCommentOnCard(param) {
    const cmd = `${this.getCardPrefixWithId(param.id)}/actions/comments`
    const {text} = param
    return this.post(cmd, {text})
  }

  /**
   * Add due date to a card using a relative offset
   * the offset object has a count property (a number) and a units property 
   *  `days, months, years, quarters, hours, minutes`  
   * @param {{id,offset:{count:Number,units:string}}} param 
   * @returns {Promise<Object<string,any>>} a Promise of a card object - card will updated due date
   */
  addDueDateToCardByOffset(param) {
    // @ts-ignore
    const dueDate = moment().add(param.offset.count, param.offset.units)
    return this.put(this.getCardDueCmd(param.id), {value: dueDate.format()})
  }
}

module.exports = TrelloPlus