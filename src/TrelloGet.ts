import {TrelloBase} from './TrelloBase'
import {GetCommandString} from './functionTypes'
import {hasListId} from './typeGuards'
import * as I from './Interfaces'

import * as  tv from './typeValidate'

export class TrelloGet extends TrelloBase {
  //  🏗
  public constructor(pathString?: string) {
    super(pathString)
  }

  private static validateAndGetId(param: I.ListOrBoardType): string {
    if (hasListId(param)) {
      tv.validate({obj: param, reqKeys: ['listId']})
      return param.listId
    }
    tv.validate({obj: param, reqKeys: ['boardId']})
    return param.boardId
  }

  /**
   * Avoid repeating the common code where we need to do the following sequence:
   * validate the parameters
   * extract the id
   * make a call to get the command with the id
   * issue the get command
   */
  private getCardsRecipe(param: I.ListOrBoardType,  commandFunc: GetCommandString): I.RestPromise {
    const id = TrelloGet.validateAndGetId(param)
    const options = param.options || {}
    const path: string = commandFunc(id)
    return this.get({path, options})
  }

  /**
   * Get a card based on passed Id and options
   */
  public getCard(cardParam: I.CardOptionsType): I.TrelloPromise {
    tv.validate({obj: cardParam, reqKeys: ['cardId']})
    const options = cardParam.options || {}
    const {cardId} = cardParam
    const path = TrelloBase.getBoardPrefixWithId(cardId)
    return this.get({path, options})
  }

  /** Get the actions on the card. Filter by tye action type if desired
   * defaults to 'all'. For all action types see
   * https://developers.trello.com/reference/#action-types
   */
  public getActionsOnCard(param: I.CardOptionsType): I.TrelloPromise {
    tv.validate({obj: param, reqKeys: ['cardId']})
    const options = param.options || {}
    const {cardId} = param
    const path = `${TrelloBase.getCardPrefixWithId(cardId)}/actions`
    options.filter = options.filter || 'all'
    options.limit = options.limit || 1000
    return this.get({path, options})
  }

  // ========================= Custom Field Setters/Getters =====================
  /**
   * Get the array of custom field items on the card.
   */
  public getCustomFieldItemsOnCard(param: I.CardId): I.TrelloPromise {
    const path = `${TrelloBase.getCardPrefixWithId(param.cardId)}/customFieldItems`
    return this.get({path})
  }

  /**
   * Get all cards on the passed list
   * @example getCardsOnListWith({listId:'123',options:{customFieldItems:true}})
   */
  public getCardsOnList(param: I.ListOptions): I.TrelloPromise {
    return this.getCardsRecipe(param, TrelloBase.getListCardCmd)
  }

  /**
   * Get all the cards on the board. Two useful options are
   * limit:x to limit the number of cards (1 to 1000) coming back and
   * fields:'name,desc'
   */
  public getCardsOnBoard(param: I.BoardOptions): I.TrelloPromise {
    return this.getCardsRecipe(param, TrelloBase.getCardsOnBoardWithId)
  }

  /**
   * Calls to retrieve archived cards from lists or boards use the same "recipe"
   * i.e. series of steps in a particular sequence. This recipe executes those
   * calls
   */
  private async getArchivedCardsRecipe(param: I.ListOrBoardType, func: GetCommandString): I.RestPromise {
    const options = param.options || {}
    param.options = this.addFilterClosedToOptions(options)
    return await this.getCardsRecipe(param, func)
  }

  /**
   * Get all cards that are archived for the passed List
   * @param {object} param
   * @param {string} param.listId
   * @param {object} param.options
   * @returns {Promise<Array.<Object>>} returns Promise to array of cards
   * @example getArchivedCardsOnList({listId'456'}) allows options? property
  */
  public async getArchivedCardsOnList(param: I.ListOptions): I.RestPromise {
    return await this.getArchivedCardsRecipe(param, TrelloBase.getListCardCmd)
  }

  /**
 * Get all cards that are archived for the board
 * @example getArchivedCardsOnBoard({boardId:'123'}) allows options? property
 */
  public async getArchivedCardsOnBoard(param: I.BoardOptions): I.RestPromise {
    return await this.getArchivedCardsRecipe(param, TrelloBase.getCardsOnBoardWithId)
  }

  public addFilterClosedToOptions(options: I.DictObj): I.DictObj {
    return {...options, filter: 'closed'}
  }

  /**
   * Find the boardId for the given listId
   */
  public async getBoardIdFromListId(param: I.ListId): I.RestPromise {
    tv.validate({obj: param, reqKeys: ['listId']})
    const {listId} = param
    const path = `${TrelloBase.getListPrefixWithId(listId)}/board`
    return await this.get({path, options: {fields: 'id'}})
  }

  /**
   * Get all the members on the passed board
   */
  public getMembersOnBoard(param: I.BoardId): Promise<I.TrelloMemberData[]> {
    tv.validate({obj: param, reqKeys: ['boardId']})
    const {boardId} = param
    const path = `${TrelloBase.getBoardPrefixWithId(boardId)}/members`
    return this.get({path}) as Promise<I.TrelloMemberData[]>
  }
}
