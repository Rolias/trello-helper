const TrelloBase = require('./TrelloBase')
const tv = require('./typeValidate')

class TrelloGetL1 extends TrelloBase {
  constructor(pathString) {
    super(pathString)
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
    TrelloBase.validateListIdAndOptions(param)
    const {listId, options} = param
    const path = `${TrelloBase.getListCardCmd(listId)}`
    return this.get({path, options})
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
    TrelloBase.validateListIdAndOptions(param)
    const {listId} = param
    const options = {...param.options, filter: 'closed'}
    return await this.getCardsOnList({listId, options})
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
    TrelloBase.validateBoardIdAndOptions(param)
    const {boardId, options} = param
    const path = `${TrelloBase.getBoardPrefixWithId(boardId)}/cards`
    return this.get({path, options})
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

module.exports = TrelloGetL1