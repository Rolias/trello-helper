import TrelloBase from './TrelloBase'
import {IListOptions, IListOrBoardType, IDictObj, ITrelloMemberData, IBoardOptions, ICardOptionsType, ITrelloPromise, IRestPromise, CmdFunc} from './Interfaces'
import * as  tv from './typeValidate'

export default class TrelloGet extends TrelloBase {
  //  🏗
  public constructor(pathString?: string) {
    super(pathString)
  }

  private static validateIdAndOptions(param: IListOrBoardType, idType: string): void {
    tv.validate({obj: param, reqKeys: [idType, 'options']})
  }

  /**
   * Avoid repeating the common code where we need to do the following sequence:
   * validate the parameters
   * extract the id
   * make a call to get the command with the id
   * issue the get command
   */
  private getCardsRecipe(param: IListOrBoardType, idType: string, commandFunc: CmdFunc): IRestPromise {
    TrelloGet.validateIdAndOptions(param, idType)
    const {options} = param
    const id: string = param[idType]
    const path: string = commandFunc(id)
    return this.get({path, options})
  }

  /**
   * Get a card based on passed Id and options
   */
  public getCard(cardParam: ICardOptionsType): ITrelloPromise {
    tv.validate({obj: cardParam, reqKeys: ['cardId', 'options']})
    const {cardId, options} = cardParam
    const path = TrelloBase.getBoardPrefixWithId(cardId)
    return this.get({path, options})
  }

  /** Get the actions on the card. Filter by tye action type if desired
   * defaults to 'all'. For all action types see
   * https://developers.trello.com/reference/#action-types
   */
  public getActionsOnCard(param: ICardOptionsType): ITrelloPromise {
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
   */
  public getCustomFieldItemsOnCard(param: {cardId: string}): ITrelloPromise {
    const path = `${TrelloBase.getCardPrefixWithId(param.cardId)}/customFieldItems`
    return this.get({path, options: {}})
  }

  /**
   * Get all cards on the passed list
   * @example getCardsOnListWith({listId:'123',options:{customFieldItems:true}})
   */
  public getCardsOnList(param: IListOptions): ITrelloPromise {
    return this.getCardsRecipe(param, 'listId', TrelloBase.getListCardCmd)
  }

  /**
   * Get all the cards on the board. Two useful options are
   * limit:x to limit the number of cards (1 to 1000) coming back and
   * fields:'name,desc'
   */
  public getCardsOnBoard(param: IBoardOptions): ITrelloPromise {
    return this.getCardsRecipe(param, 'boardId', TrelloBase.getCardsOnBoardWithId)
  }

  /**
   * Calls to retrieve archived cards from lists or boards use the same "recipe"
   * i.e. series of steps in a particular sequence. This recipe executes those
   * calls
   */
  private async getArchivedCardsRecipe(param: IListOrBoardType, idType: string, func: CmdFunc): IRestPromise {
    tv.validateOptions(param)
    const options = this.addFilterClosedToOptions(param.options)
    param.options = options
    return await this.getCardsRecipe(param, idType, func)
  }

  /**
   * Get all cards that are archived for the passed List
   * @param {object} param
   * @param {string} param.listId
   * @param {object} param.options
   * @returns {Promise<Array.<Object>>} returns Promise to array of cards
   * @example getArchivedCards({boardId:'123',listId'456'})
  */
  public async getArchivedCardsOnList(param: IListOptions): IRestPromise {
    return await this.getArchivedCardsRecipe(param, 'listId', TrelloBase.getListCardCmd)
  }

  /**
 * Get all cards that are archived for the board
 * @example getArchivedCards({boardId:'123',listId'456'})
 */
  public async getArchivedCardsOnBoard(param: IBoardOptions): IRestPromise {
    return await this.getArchivedCardsRecipe(param, 'boardId', TrelloBase.getCardsOnBoardWithId)
  }

  public addFilterClosedToOptions(options: IDictObj): IDictObj {
    return {...options, filter: 'closed'}
  }

  /**
   * Find the boardId for the given listID
   */
  public async getBoardIdFromListId(param: {listId: string}): IRestPromise {
    tv.validate({obj: param, reqKeys: ['listId']})
    const {listId} = param
    const path = `${TrelloBase.getListPrefixWithId(listId)}/board`
    return await this.get({path, options: {fields: 'id'}})
  }

  /**
   * Get all the members on the passed board
   */
  public getMembersOnBoard(param: {boardId: string}): Promise<ITrelloMemberData[]> {
    tv.validate({obj: param, reqKeys: ['boardId']})
    const {boardId} = param
    const path = `${TrelloBase.getBoardPrefixWithId(boardId)}/members`
    return this.get({path, options: {}}) as Promise<ITrelloMemberData[]>
  }
}