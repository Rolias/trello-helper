// @ts-check
/** @module */
const TrelloRequest = require('./trelloRequest')
const envCreate = require('env-create')
const logger = require('./util/logger')
const moment = require('moment')


class Trello {
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
    const {appKey: key, token} = trelloAuth
    this.trelloRequest = new TrelloRequest({key, token})
  }
  /**
   * @typedef {{cardId:string, fieldId:string}} cardFieldType 
   */

  /** @return '/1/cards'  */
  static getBaseCardCmd() {return '/1/cards'}
  /** @returns `/1/cards/<id>' */
  static getCardPrefixWithId(cardId) {return `${Trello.getBaseCardCmd()}/${cardId}`}
  /** @return '/1/cards/<id>/due */
  static getCardDueCmd(cardId) {return `${Trello.getCardPrefixWithId(cardId)}/due`}
  /** @returns '/1/lists/<listId>' */
  static getListPrefixWithId(listId) {return `/1/lists/${listId}`}
  /** @returns '/1/lists/<id>/cards */
  static getListCardCmd(listId) {return `${Trello.getListPrefixWithId(listId)}/cards`}
  /** @returns '/1/boards/<id>' */
  static getBoardPrefixWithId(boardId) {return `/1/board/${boardId}`}

  /** @param {cardFieldType} cfp - the Card Field Parameter*/
  static getCustomFieldUpdateCmd(cfp) {return `/1/cards/${cfp.cardId}/customField/${cfp.fieldId}/item`}

  /**
  * Wrap the underlying makeRequest for get
  * @param {string} path technically an http path but to the Trello API its command
  * @param {Object=} options  
  * @return {Promise<any>}
  * @example get(this.getListCardCmd('123'), {limit:10})
  */
  async get(path, options) {
    const getOptions = {
      path,
      options,
    }
    const responseStr = await this.trelloRequest.get(getOptions)
    return responseStr
    // return this.makeRequest('get', path, options)
  }
  /** wrap the underlying makeRequest for put 
   * @param {string} path  technically an http path but to the Trello API it's command
   * @param {Object} options  
   * @return {Promise<any>}
   * @example  put(getCardPrefixWithId(<cardId>), {dueComplete: true})
   */
  async put(path, options) {
    const putOptions = {
      path,
      body: options,
    }
    return await this.trelloRequest.put(putOptions)
  }

  /**
  * Wrap the underlying makeRequest for post
  * @param {string} path technically an http path but to the Trello API it's command
  * @param {Object=} options  
  * @return {Promise<any>}
  * @example post(this.getBaseCardCmd(), {name:'card name', description:'some desc., idList:<idOfList>})
  */
  async post(path, options) {
    const postOptions = {
      path,
      body: options,
    }
    return await this.trelloRequest.post(postOptions)

  }

  /** wrap the underlying makeRequest for delete 
  * @param {string} path 
  * @param {Object=} options  
  * @return {Promise<any>}
  * @example  delete(getCardPrefixWithId(<cardId>)})
  */
  async delete(path, options) {
    const deleteOptions = {
      path,
      options,
    }
    return await this.trelloRequest.delete(deleteOptions)
    // return this.makeRequest('delete', path, options)
  }

  /** Get all the actions on the card
   * @param {{id:string, filter=:string}} param
   * @returns {Promise<Array.<Object<string,any>>>}
   */
  getAllActionsOnCard(param) {
    const path = `${Trello.getCardPrefixWithId(param.id)}/actions`
    const filterValue = param.filter || 'all'
    const options = {
      filter: filterValue,
      // eslint-disable-next-line camelcase
      limit: 1000,
    }
    return this.get(path, options)
  }

  // ========================= Custom Field Setters/Getters =====================  
  getCustomFieldItemsOnCard(cardId) {
    const path = `${Trello.getCardPrefixWithId(cardId)}/customFieldItems`
    // const options = {filter: 'all'}
    return this.get(path)
  }

  /**
   * 
   * @param {{cardFieldObj:{cardId:string, fieldId:string}, type:string, value:string}} customFieldObj 
   *    * type can be  'text', 'number', 'date', 'checked' or for a list 
   * 'idValue' which takes the id of the list option
   */
  setCustomFieldValueOnCard(customFieldObj) {
    const cmd = Trello.getCustomFieldUpdateCmd(customFieldObj.cardFieldObj)
    const valueObj = {value: {}}
    const {type, value} = customFieldObj
    valueObj.value[type] = value
    return this.put(cmd, valueObj)
  }

  /**
   * Get all archived cards from the board that match the passed list id
   * @param {{id:string, options=}} param  
   * @returns {Promise<Array<Object<string,any>>>} a Promise of an array of card objects
   * @example getCardsOnListWith({id:'123',options:{customFieldItems:true}})
   */
  getCardsOnList(param) {
    const path = `${Trello.getListCardCmd(param.id)}`
    const {options} = param
    return this.get(path, options)
  }

  /**
   * Get all the cards on the board. Two useful options are
   * limit:x to limit the number of cards (1 to 1000) coming back and
   * fields:'name,desc'
   * @param {{id:string, options=}} param 
   * @returns {Promise<Array<Object<string,any>>>} a Promise of an array of card objects
   */
  getCardsOnBoard(param) {
    const {id, options} = param
    const path = `${Trello.getBoardPrefixWithId(id)}/cards`
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
    const path = `${Trello.getBoardPrefixWithId(param.boardId)}/cards`
    const archivedCards = await this.get(path, options)
    if (archivedCards.length < 1) {return []}
    const archivedOnList = archivedCards.filter(e => e.idList === list)
    return archivedOnList
  }

  /**
   * Archives all the cards on the passed list id
   * @param {{id:string}} param 
   * @returns {Promise<object>}
   * 
   */
  async archiveAllCardsOnList(param) {
    const path = `${Trello.getListPrefixWithId(param.id)}/archiveAllCards`
    return this.post(path, {})
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
    const cmd = Trello.getCardPrefixWithId(param.id)
    const options = {dueComplete: param.isComplete}
    return this.put(cmd, options)
  }

  /**
   * Add the card to the specified list. Use name and optional description
   * @param {{name:string, desc:string, idList:string, idMembers=:string}} param 
   * @returns {Promise<Object<string,any>>} a Promise of a card object
   * @example addCard({name:'my name',description:'test',idList:'12345"})
   */
  addCard(param) {
    return this.post(Trello.getBaseCardCmd(), param)
  }

  deleteCard(id) {
    const cmd = Trello.getCardPrefixWithId(id)
    return this.delete(cmd)
  }
  /**
   * Add a comment to the card
   * @param {{id,text}} param id of the card and text for the comment
   * @returns {Promise<Object<string,any>>} a Promise of a card object
   * @example addCommentOnCard({id:'123',text:"message for comment"})
   */
  addCommentOnCard(param) {
    const cmd = `${Trello.getCardPrefixWithId(param.id)}/actions/comments`
    const {text} = param
    return this.post(cmd, {text})
  }

  /**
   * Add a member to a card using the member's id
   * @param {{cardId:string,memberId:string}} param 
   */
  addMemberToCard(param) {
    const {cardId, memberId} = param
    const cmd = `${Trello.getCardPrefixWithId(cardId)}/members`
    return this.post(cmd, {value: memberId})
  }

  removeMemberFromCard(param) {
    const {cardId, memberId} = param
    const cmd = `${Trello.getCardPrefixWithId(cardId)}/idMembers/${memberId}`
    return this.delete(cmd)
  }

  /**
   * Get all the members on the passed board
   * @param {{boardId:string}} param 
   * @returns {Promise<Array<{id:string, fullName:string, username:string}>>}
   */
  getMembersOnBoard(param) {
    const {boardId} = param
    const cmd = `${Trello.getBoardPrefixWithId(boardId)}/members`
    return this.get(cmd, {})
  }

  /**
   * Add due date to a card using a relative offset
   * the offset object has a count property (a number) and a units property 
   *  `days, months, years, quarters, hours, minutes`  
   * @param {{id,offset:{count:Number,units:string}}} param 
   * @returns {Promise<Object<string,any>>} a Promise of a card object - card will updated due date
   * @example await trello.addDueDateToCardByOffset({
        id: FAKE_ID,
        offset: {count: 7, units: 'days'},
      })
   */
  addDueDateToCardByOffset(param) {
    // @ts-ignore
    const dueDate = moment().add(param.offset.count, param.offset.units)
    const cmd = Trello.getCardDueCmd(param.id)
    return this.put(cmd, {value: dueDate.format()})
  }


}

module.exports = Trello