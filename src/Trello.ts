/** @module trello */
import * as moment from 'moment'
import TrelloGet from './TrelloGet'
import TrelloBase from './TrelloBase'
import * as tv from './typeValidate'
import { CustomFieldType, IArchiveOffset, IDictObj, 
  IActionFilterType, IRestPromise, ITrelloAction, ICardDueDateOffset, ICardMemberType, IListId, ICardId, ICustomFieldType } from './Interfaces';

// I want the user to just have to import Trello but I wanted to make the code easier
// to manage so I split it up into various classes which just extend each other
// TrelloGet extends TrelloBase. As this library grows I made to add more layers. The goal
// is to keep each layer to 20 functions or fewer for improved maintainability.
export default class Trello extends TrelloGet {
  /**
   * Create the TrelloPLus class to add more trello functions
   * @param {string=} pathString path to the trello JSON credentials file
   */
  constructor(pathString?:string) {
    super(pathString)
  }

  /**
   * Set the value of a custom Field object
      * @returns Promise<{}> an empty object- oh well so much for testing
   */
  setCustomFieldValueOnCard(customFieldObj:ICustomFieldType) :IRestPromise{
    tv.validate({obj: customFieldObj, reqKeys: ['cardFieldObj', 'type', 'value']})
    tv.validate({obj: customFieldObj.cardFieldObj, reqKeys: ['cardId', 'fieldId']})

    const path = TrelloBase.getCustomFieldUpdateCmd(customFieldObj.cardFieldObj)
    const valueObj :{idValue?:string, value?:any}= {}
    const {type, value} = customFieldObj
    // a list takes a simple {idValue:'value'}
    if (type === CustomFieldType.list) {
      valueObj.idValue = value
    } else { // the others take a {value: {'type':'value}} where type is something like text, number etc...
      valueObj.value = {}
      valueObj.value[type] = value
    }
    return this.put({path, options: valueObj})
  }


  /**
   * Archive cards on list older than the passed relative date
   */
  async archiveCardsOlderThan(param:IArchiveOffset): Promise<any> {
    tv.validate({obj: param, reqKeys: ['listId', 'offset']})
    tv.validate({obj: param.offset, reqKeys: ['count', 'units']})
    const {listId, offset} = param
    const {count, units} = offset
    const cutoffDate = moment().subtract(count, units)
      .toISOString()

    const allCards = await this.getCardsOnList({listId, options: {}})
    const newerCards = await this.getCardsOnList({listId, options: {since: cutoffDate}})
    const olderCards:IDictObj[] = allCards.filter(card => !newerCards.includes(card))

    for (const card of olderCards) {
      await this.archiveCard({cardId: card.id})
    }
  }

  /**
    * Archive the card with the passed ID
    */
  async archiveCard(param:ICardId):IRestPromise {
    tv.validate({obj: param, reqKeys: ['cardId']})
    const path = TrelloBase.getCardPrefixWithId(param.cardId)
    const options = {closed: true}
    return this.put({path, options})
  }

  /**
   * Archives all the cards on the passed list id
   */
  async archiveAllCardsOnList(param:IListId):IRestPromise {
    tv.validate({obj: param, reqKeys: ['listId']})
    const path = `${TrelloBase.getListPrefixWithId(param.listId)}/archiveAllCards`
    return this.post({path, options: {}})
  }

  /**
    * Unarchive all the cards on a particular list (set closed state to false)
    */
  async unarchiveAllCardsOnList(param:IListId): Promise<any> {
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
   * @returns {Promise<Object<string,any>>} a Promise of a card object
   * @example setDueComplete({id:'123', isComplete:true})
   */
  setDueComplete(param:{cardId:string, isComplete:boolean}):IRestPromise {
    tv.validate({obj: param, reqKeys: ['cardId', 'isComplete']})
    const path = TrelloBase.getCardPrefixWithId(param.cardId)
    const options = {dueComplete: param.isComplete}
    return this.put({path, options})
  }

  /**
   *
   * @param {object} param
   * @param {string} param.cardId
   * @param {boolean} param.isClosed
   */
  setClosedState(param:{cardId:string, isClosed:boolean}):IRestPromise {
    tv.validate({obj: param, reqKeys: ['cardId', 'isClosed']})
    const {cardId, isClosed} = param
    const path = TrelloBase.getCardPrefixWithId(cardId)
    const options = {closed: isClosed}
    return this.put({path, options})
  }

  /**
   * Add the card to the specified list. Use name and  description
   * @example addCard({name:'my name',description:'test',idList:'12345"})
   */
  addCard(options:{idList:string, name:string}): IRestPromise {
    tv.validate({obj: options, reqKeys: ['idList', 'name']})
    return this.post({path: TrelloBase.getBaseCardCmd(), options})
  }

  /**
   * like addCard() but takes a comma separated list of memberIds
   * @param {object} options
   * @param {string} options.idList
   * @param {string} options.idMembers comma separated list of memberIds
   */
  addCardWithMembers(options:{idList:string, idMembers:string}):IRestPromise {
    tv.validate({obj: options, reqKeys: ['idList', 'idMembers']})
    return this.post({path: TrelloBase.getBaseCardCmd(), options})
  }

  /**
   * Add a card with any of the available options like idAttachmentCover:string,
   * idLabels:comma separated string of Label IDs, pos ('top', 'bottom' or positive float),
   * due (when the card is due mm/dd/yyy),dueComplete:boolean ,subscribed:boolean
   * User is responsible for knowing the names of the api query params
   * idList had a red asterisk in docs so I'm assuming that means it's required
   * https://developers.trello.com/reference/#cardsid-1
   * @example addCardWithAnything({idList:123,name:'card name', idMembers:'1,2,3'})
   */
  addCardWithAnything(options:{idList:string, [key: string]: any}) {
    tv.validate({obj: options, reqKeys: ['idList']})
    return this.post({path: TrelloBase.getBaseCardCmd(), options})
  }


    // TODO change cardId to be idCard to be consistent with idList
  // also avoids the problem of users typing cardID instead of cardId


  /**
   * Delete the card with the passed Id
   */
  deleteCard(param:{cardId:string}):IRestPromise {
    tv.validate({obj: param, reqKeys: ['cardId']})
    const path = TrelloBase.getCardPrefixWithId(param.cardId)
    return this.delete({path, options: {}})
  }

  /**
   * Add a comment to the card
   * @example addCommentOnCard({cardId:'123',text:"message for comment"})
   */
  addCommentOnCard(param:{cardId:string, text:string}):IRestPromise {
    tv.validate({obj: param, reqKeys: ['cardId', 'text']})
    const path = `${TrelloBase.getCardPrefixWithId(param.cardId)}/actions/comments`
    const {text} = param
    return this.post({path, options: {text}})
  }

  /**
   * Add a member to a card using the member's id
   */
  addMemberToCard(param:ICardMemberType):IRestPromise {
    tv.validate({obj: param, reqKeys: ['cardId', 'memberId']})
    const {cardId, memberId} = param
    const path = `${TrelloBase.getCardPrefixWithId(cardId)}/members`
    return this.post({path, options: {value: memberId}})
  }

  /**
   * Remove member from the card
   */
  removeMemberFromCard(param:ICardMemberType): IRestPromise {
    tv.validate({obj: param, reqKeys: ['cardId', 'memberId']})
    const {cardId, memberId} = param
    const path = `${TrelloBase.getCardPrefixWithId(cardId)}/idMembers/${memberId}`
    return this.delete({path, options: {}})
  }

  /**
   * Add due date to a card using a relative offset
   * @returns {Promise<Object<string,any>>} a Promise of a card object - card will updated due date
   * @example await addDueDateToCardByOffset({
        id: FAKE_ID,
        offset: {count: 7, units: 'days'},
      })
   */
  addDueDateToCardByOffset(param:ICardDueDateOffset):IRestPromise {
    tv.validate({obj: param, reqKeys: ['cardId', 'offset']})
    tv.validate({obj: param.offset, reqKeys: ['count', 'units']})

    const dueDate = moment().add(param.offset.count, param.offset.units)
    const path = TrelloBase.getCardDueCmd(param.cardId)
    return this.put({path, options: {value: dueDate.format()}})
  }

  /**
 * Find actions in array whose `type` field matches the passed type property
 * @param {object} param
 * @param {object[]} param.actions
 * @param {string} param.actions[].type
 * @param {string} param.filterType
 * @returns {Array<Object<string,any>>} - array of matching actions
 * @usage filterActionsByType({actions:[], filterType:'updateCard'})
 */
  static filterActionsByType(param: IActionFilterType): IDictObj[] {
    tv.validate({obj: param, reqKeys: ['actions', 'filterType']})
    return param.actions.filter((e:{type:string}):boolean => e.type === param.filterType)
  }

  /**
  * Find any actions that are of type 'moveCardToBoard' and capture
  * the number found and the date of the first one found
  * @param {object[]} actions the action objects
  * @returns {Array.<Object<string,any>>} array of actions of the moveCardToBoardType
  * will have count of number of actions found. Date has date of first object found
  * @example getMoveCardToBoardInfo([{actionObjects}])
  */
  static getMoveCardToBoardActions(actions: ITrelloAction[]): IDictObj[] {
    return Trello.filterActionsByType({actions, filterType: 'moveCardToBoard'})
  }
}
