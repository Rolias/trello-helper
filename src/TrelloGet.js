const TrelloBase = require('./TrelloBase')
const tv = require('./typeValidate')

class TrelloGet extends TrelloBase {
  constructor(pathString) {
    super(pathString)
  }

  /**
   * 
   * @param {{listId:string, options:string}| {boardId:string, options:string}} param 
   * @param {string} idType listId or boardId 
   */
  static validateIdAndOptions(param, idType) {
    tv.validate({obj: param, reqKeys: [idType, 'options']})
  }


  /**
 * @param {Object} cardParam the id and options for the card
 * @param {string} cardParam.cardId
 * @param {object} cardParam.options
 */
  getCard(cardParam) {
    tv.validate({obj: cardParam, reqKeys: ['cardId', 'options']})
    const {cardId, options} = cardParam
    const path = TrelloBase.getBoardPrefixWithId(cardId)
    return this.get({path, options})
  }

  /** Get the actions on the card. Filter by tye action type if desired
   * defaults to 'all' for all action types see
   * https://developers.trello.com/reference/#action-types
   * @param {object} param
   * @param {string} param.cardId
   * @param {object} param.options
   * @returns {Promise<Array.<Object<string,any>>>}
   */
  getActionsOnCard(param) {
    tv.validate({obj: param, reqKeys: ['cardId', 'options']})
    const {cardId, options} = param
    const path = `${TrelloBase.getCardPrefixWithId(cardId)}/actions`
    options.filter = options.filter || 'all'
    options.limit = options.limit || 1000
    return this.get({path, options})
  }

  // ========================= Custom Field Setters/Getters =====================  
  /**
   * Get the array of custom field items on the card.
   * @param {object} param 
   * @param {string} param.cardId
   * @returns {Promise<Array<object>>}
   */
  getCustomFieldItemsOnCard(param) {
    const path = `${TrelloBase.getCardPrefixWithId(param.cardId)}/customFieldItems`
    return this.get({path, options: {}})
  }

  /**
   * Get all archived cards from the board that match the passed list id
   * @param {object} param  
   * @param {string} param.listId 
   * @param {object} param.options
   * @returns {Promise<Array<Object<string,any>>>} a Promise of an array of card objects
   * @example getCardsOnListWith({listId:'123',options:{customFieldItems:true}})
   */
  getCardsOnList(param) {
    return this.getCardsRecipe(param, 'listId', TrelloBase.getListCardCmd)
  }

  /**
   * Avoid repeating the common code where we need to first
   * validate the parameters
   * then extract the id
   * then make a call to get the command with the id
   * then go the get
   * @param {{listId:string, options:string}| {boardId:string, options:string}} param   
   * @param {string} type 'listId' or 'boardId' 
   * @param {*} commandFunc a function(id) that returns a command string
   */
  getCardsRecipe(param, type, commandFunc) {
    TrelloGet.validateIdAndOptions(param, type)
    const {options} = param
    const id = param[type]
    const path = commandFunc(id)
    return this.get({path, options})
  }
  /**
   * Get all the cards on the board. Two useful options are
   * limit:x to limit the number of cards (1 to 1000) coming back and
   * fields:'name,desc'
   * @param {object} param 
   * @param {string} param.boardId
   * @param {object} param.options
   * @returns {Promise<Array<Object<string,any>>>} a Promise of an array of card objects
   */
  getCardsOnBoard(param) {
    return this.getCardsRecipe(param, 'boardId', TrelloBase.getCardsOnBoardWithId)
  }


  /**
   * Get all cards that are archived for the board
   * @param {object} param 
   * @param {string} param.listId
   * @param {object} param.options
   * @returns {Promise<Array.<Object>>} returns Promise to array of cards
   * @example getArchivedCards({boardId:'123',listId'456'})
  */
  async getArchivedCardsOnList(param) {
    TrelloGet.validateIdAndOptions(param, 'listId')
    const {listId} = param
    const options = this.addFilterClosedToOptions(param.options)
    return await this.getCardsOnList({listId, options})
  }

  /**
 * Get all cards that are archived for the board
 * @param {{boardId:string, options:object}} param 
 * @returns {Promise<Array.<Object>>} returns Promise to array of cards
 * @example getArchivedCards({boardId:'123',listId'456'})
 */
  async getArchivedCardsOnBoard(param) {
    TrelloGet.validateIdAndOptions(param, 'boardId')
    const {boardId} = param
    const options = this.addFilterClosedToOptions(param.options)
    return await this.getCardsOnBoard({boardId, options})
  }

  addFilterClosedToOptions(options) {
    return {...options, filter: 'closed'}
  }

  /**
   * @deprecated Get archived cards either directly from a board (getArchivedCardsOnBoard())
   * or from a list (getArchivedCardsOnList())  instead of this method
   * Get all cards that are archived for the board
   * @param {{boardId,listId}} param 
   * @returns {Promise<Array.<Object>>} returns Promise to array of cards
   * @example getArchivedCards({boardId:'123',listId'456'})
   */
  async getArchivedCards(param) {
    tv.validate({obj: param, reqKeys: ['boardId', 'listId']})
    const options = {filter: 'closed'}
    const {boardId, listId} = param
    const archivedCards = await this.getCardsOnBoard({boardId, options})

    if (archivedCards.length < 1) {return []}
    const archivedOnList = archivedCards.filter(e => e.idList === listId)
    return archivedOnList
  }

  /**
   * Find the boardId for the given listID
   * @param {object} param 
   * @param {string} param.listId
   */
  async getBoardIdFromListId(param) {
    tv.validate({obj: param, reqKeys: ['listId']})
    const {listId} = param
    const path = `${TrelloBase.getListPrefixWithId(listId)}/board`
    return await this.get({path, options: {fields: 'id'}})
  }

  /**
   * Get all the members on the passed board
   * @param {object} param 
   * @param {string} param.boardId
   * @returns {Promise<Array<{id:string, fullName:string, username:string}>>}
   */
  getMembersOnBoard(param) {
    tv.validate({obj: param, reqKeys: ['boardId']})
    const {boardId} = param
    const path = `${TrelloBase.getBoardPrefixWithId(boardId)}/members`
    return this.get({path, options: {}})
  }

}

module.exports = TrelloGet