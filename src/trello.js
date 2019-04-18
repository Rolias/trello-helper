// @ts-check
/** @module trello */
const moment = require('moment')
const TrelloGet = require('./TrelloGet')
const tv = require('./typeValidate')

class Trello extends TrelloGet {
  /**
   * Create the TrelloPLus class to add more trello functions
   * @param {string=} pathString path to the trello JSON credentials file
   */
  constructor(pathString) {
    super(pathString)
  }

  /**
   * Set the value of a custom Field object
   * @param {object} customFieldObj 
   * @param {object} customFieldObj.cardFieldObj
   * @param {string} customFieldObj.cardFieldObj.cardId
   * @param {string} customFieldObj.cardFieldObj.fieldId
   * @param {string} customFieldObj.type see {@link Trello.customFieldType} enum below for valid types 
   * @param {string} customFieldObj.value what goes in this custom field (for a list field it's the ID of the list item) 
   * @returns {{}} an empty object- oh well so much for testing
   */
  setCustomFieldValueOnCard(customFieldObj) {
    tv.validate({obj: customFieldObj, reqKeys: ['cardFieldObj', 'type', 'value']})
    tv.validate({obj: customFieldObj.cardFieldObj, reqKeys: ['cardId', 'fieldId']})

    const fieldType = Trello.customFieldType
    const path = Trello.getCustomFieldUpdateCmd(customFieldObj.cardFieldObj)
    const valueObj = {}
    const {type, value} = customFieldObj
    // a list takes a simple {idValue:'value'}
    if (type === fieldType.list) {
      valueObj.idValue = value
    } else { // the others take a {value: {'type':'value}} where type is something like text, number etc...
      valueObj.value = {}
      valueObj.value[type] = value
    }
    return this.put({path, options: valueObj})
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
   * Archive cards on list older than the passed relative date
   * @param {object} param 
   * @param {string} param.listId
   * @param {object} param.offset
   * @param {moment.DurationInputArg1} param.offset.count
   * @param {moment.DurationInputArg2} param.offset.units
   */
  async archiveCardsOlderThan(param) {
    tv.validate({obj: param, reqKeys: ['listId', 'offset']})
    tv.validate({obj: param.offset, reqKeys: ['count', 'units']})
    const {listId, offset} = param
    const {count, units} = offset
    const cutoffDate = moment().subtract(count, units)
      .toISOString()

    const allCards = await this.getCardsOnList({listId, options: {}})
    const newerCards = await this.getCardsOnList({listId, options: {since: cutoffDate}})
    const olderCards = allCards.filter(card => !newerCards.includes(card))

    for (const card of olderCards) {
      await this.archiveCard({cardId: card.id})
    }
  }

  /**
    * Archive the card with the passed ID 
    * @param {object} param 
    * @param {string} param.cardId
    * @returns {Promise<object>}
    */
  async archiveCard(param) {
    tv.validate({obj: param, reqKeys: ['cardId']})
    const path = Trello.getCardPrefixWithId(param.cardId)
    const options = {closed: true}
    return this.put({path, options})
  }

  /**
   * Archives all the cards on the passed list id
   * @param {object} param 
   * @param {string} param.listId
   * @returns {Promise<object>}
   */
  async archiveAllCardsOnList(param) {
    tv.validate({obj: param, reqKeys: ['listId']})
    const path = `${Trello.getListPrefixWithId(param.listId)}/archiveAllCards`
    return this.post({path, options: {}})
  }

  /**
    * Unarchive all the cards on a particular list (set closed state to false)
    * @param {object} param 
    * @param {string} param.listId
    * @returns {Promise}
    */
  async unarchiveAllCardsOnList(param) {
    tv.validate({obj: param, reqKeys: ['listId']})
    const {listId} = param
    const archivedCards = await this.getArchivedCardsOnList({listId, options: {fields: 'name'}})
    // NOTE - to minimize rate errors we await setting each card to unarchived.
    for (const card of archivedCards) {
      await this.setClosedState({cardId: card.id, isClosed: false})
    }
  }

  /**
   * Set the due date on card as complete when isComplete:true or clear it if 
   * isComplete:false
   * @param {object} param 
   * @param {string} param.cardId
   * @param {boolean} param.isComplete
   * @returns {Promise<Object<string,any>>} a Promise of a card object
   * @example setDueComplete({id:'123', isComplete:true})
   */
  setDueComplete(param) {
    tv.validate({obj: param, reqKeys: ['cardId', 'isComplete']})
    const path = Trello.getCardPrefixWithId(param.cardId)
    const options = {dueComplete: param.isComplete}
    return this.put({path, options})
  }

  /**
   * 
   * @param {object} param 
   * @param {string} param.cardId
   * @param {boolean} param.isClosed
   */
  setClosedState(param) {
    tv.validate({obj: param, reqKeys: ['cardId', 'isClosed']})
    const {cardId, isClosed} = param
    const path = Trello.getCardPrefixWithId(cardId)
    const options = {closed: isClosed}
    return this.put({path, options})
  }

  /**
   * Add the card to the specified list. Use name and  description
   * @param {object} options 
   * @param {string} options.idList
   * @param {string} options.name
   * @param {string} options.desc
   * @returns {Promise<Object<string,any>>} a Promise of a card object
   * @example addCard({name:'my name',description:'test',idList:'12345"})
   */
  addCard(options) {
    tv.validate({obj: options, reqKeys: ['idList', 'name', 'desc']})
    return this.post({path: Trello.getBaseCardCmd(), options})
  }

  /**
   * like addCard() but takes a comma separated list of memberIds
   * @param {object} options 
   * @param {string} options.idList
   * @param {string} options.name
   * @param {string} options.desc
   * @param {string} options.idMembers comma separated list of memberIds
   */
  addCardWithMembers(options) {
    tv.validate({obj: options, reqKeys: ['idList', 'name', 'desc', 'idMembers']})
    return this.post({path: Trello.getBaseCardCmd(), options})
  }

  /**
   * Add a card with any of the available options like idAttachmentCover:string, 
   * idLabels:comma separated string of Label IDs, pos ('top', 'bottom' or positive float),
   * due (when the card is due mm/dd/yyy),dueComplete:boolean ,subscribed:boolean
   * User is responsible for knowing the names of the api query params
   * https://developers.trello.com/reference/#cardsid-1
   * @param {object} options 
   * @example addCardWithAnything({idList:123,name:'card name', due:true})
   */
  addCardWithAnything(options) {
    return this.post({path: Trello.getBaseCardCmd(), options})
  }

  /**
   * Delete the card with the passed Id
   * @param {object} param  pass in object with id of the card 
   * @param {string} param.cardId
   */
  deleteCard(param) {
    tv.validate({obj: param, reqKeys: ['cardId']})
    const path = Trello.getCardPrefixWithId(param.cardId)
    return this.delete({path, options: {}})
  }

  /**
   * Add a comment to the card
   * @param {object} param  
   * @param {string} param.cardId id of the card
   * @param {string} param.text text for the comment
   * @returns {Promise<Object<string,any>>} a Promise of a card object
   * @example addCommentOnCard({cardId:'123',text:"message for comment"})
   */
  addCommentOnCard(param) {
    tv.validate({obj: param, reqKeys: ['cardId', 'text']})
    const path = `${Trello.getCardPrefixWithId(param.cardId)}/actions/comments`
    const {text} = param
    return this.post({path, options: {text}})
  }

  /**
   * Add a member to a card using the member's id
   * @param {object} param 
   * @param {string} param.cardId
   * @param {string} param.memberId
   */
  addMemberToCard(param) {
    tv.validate({obj: param, reqKeys: ['cardId', 'memberId']})
    const {cardId, memberId} = param
    const path = `${Trello.getCardPrefixWithId(cardId)}/members`
    return this.post({path, options: {value: memberId}})
  }

  /**
   * Remove member from the card
   * @param {object} param 
   * @param {string} param.cardId
   * @param {string} param.memberId
   */
  removeMemberFromCard(param) {
    tv.validate({obj: param, reqKeys: ['cardId', 'memberId']})
    const {cardId, memberId} = param
    const path = `${Trello.getCardPrefixWithId(cardId)}/idMembers/${memberId}`
    return this.delete({path, options: {}})
  }

  /**
   * Add due date to a card using a relative offset 
   * @param {object} param 
   * @param {string} param.cardId
   * @param {object} param.offset
   * @param {moment.DurationInputArg1} param.offset.count
   * @param {moment.DurationInputArg2} param.offset.units e.g. `days, months, years, quarters, hours, minutes` 
   * @returns {Promise<Object<string,any>>} a Promise of a card object - card will updated due date
   * @example await trello.addDueDateToCardByOffset({
        id: FAKE_ID,
        offset: {count: 7, units: 'days'},
      })
   */
  addDueDateToCardByOffset(param) {
    tv.validate({obj: param, reqKeys: ['cardId', 'offset']})
    tv.validate({obj: param.offset, reqKeys: ['count', 'units']})
    // @ts-ignore
    const dueDate = moment().add(param.offset.count, param.offset.units)
    const path = Trello.getCardDueCmd(param.cardId)
    return this.put({path, options: {value: dueDate.format()}})
  }

}


module.exports = Trello