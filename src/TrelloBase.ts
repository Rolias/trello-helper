import {RestCommands, IPathOptionsType, IDictObj, IValidateType, ITrelloListBefore,
  IPathBodyType, IRestPromise, ICardFieldType, IListBefore} from './Interfaces'

import * as tv  from  './typeValidate'
import TrelloRequest  from './TrelloRequest'
import * as envCreate  from 'env-create'
import {logger} from './util/logger'
import * as utils from './util/utils'


export default class TrelloBase {
  // 🔏
  private trelloRequest: TrelloRequest;
  private retryCounter: number;

  // 🏗
  public constructor(pathString?: string) {
    const param = {path:''}
    if (pathString !== undefined) {
      param.path = pathString
    }
    const result = envCreate.load(param)
    if (result.status === false) {
      const errorMsg = `FATAL ERROR reading credentials. ${JSON.stringify(result, null, 2)}`
      logger.error(errorMsg)
      throw (errorMsg)
    }
    const trelloAuth: {appKey: string, token: string} = JSON.parse(process.env.trelloHelper as string)
    const {appKey: key, token} = trelloAuth
    this.trelloRequest = new TrelloRequest({key, token})
    this.retryCounter = 0
  }

  /** @return {string} '/1/cards'  */
  public static getBaseCardCmd(): string {return '/1/cards'}
  /**
   * returns '/1/cards/[cardId]' */
  public static getCardPrefixWithId(cardId: string): string {return `${TrelloBase.getBaseCardCmd()}/${cardId}`}
  /**
   *  returns/1/cards/[cardId]/due' */
  public static getCardDueCmd(cardId: string): string {return `${TrelloBase.getCardPrefixWithId(cardId)}/due`}
  /**
   * returns '/1/lists/[listId]' */
  public static getListPrefixWithId(listId: string): string {return `/1/lists/${listId}`}
  /**
   * returns '/1/lists/[listId]/cards' */
  public static getListCardCmd(listId: string): string {return `${TrelloBase.getListPrefixWithId(listId)}/cards`}
  /**
   *returns '/1/boards/[boardId]' */
  public  static getBoardPrefixWithId(boardId: string): string {return `/1/board/${boardId}`}
  public  static getCardsOnBoardWithId(boardId: string): string {return `${TrelloBase.getBoardPrefixWithId(boardId)}/cards`}
  public static getCustomFieldUpdateCmd(cfp: ICardFieldType): string {
    tv.validate({obj: cfp, reqKeys: ['cardId', 'fieldId']})
    return `/1/cards/${cfp.cardId}/customField/${cfp.fieldId}/item`
  }

  /**
  * Wrap the underlying makeRequest for get
  * @param {object} pathOptions technically an http path but to the Trello API its command
  * @param {string} pathOptions.path
  * @param {object} pathOptions.options
  * @return {Promise<any>}
  * @example get({path:this.getListCardCmd('123'),options: {limit:10}})
  */
  public async get(pathOptions: IPathOptionsType): IRestPromise {
    tv.validatePathOptions(pathOptions)
    const responseStr = await this.trelloRequest.get(pathOptions)
      .catch(async (error: IDictObj): IRestPromise => {
        if (error.statusCode === TrelloBase.getRateLimitError()) {
          if (this.retryCounter++ > 4) {
            throw new Error('Rate limit error hit too many times. Giving up.')
          }
          logger.error('Rate limit error - retrying...')
          await utils.delay(TrelloBase.getRateLimitDelayMs())
          await this.get(pathOptions)
        }
        else {
          throw error
        }
      })
    this.retryCounter = 0
    return responseStr as IDictObj[]
  }

  /** wrap the underlying makeRequest for delete
  * @example  delete(getCardPrefixWithId(<cardId>)})
  */
  public async delete(pathOptions: IPathOptionsType): IRestPromise {
    tv.validatePathOptions(pathOptions)
    return await this.trelloRequest.delete(pathOptions)
  }

  public async putOrPost(pathOptions: IPathOptionsType, op: RestCommands): IRestPromise {
    const options = this.createBodyOptions(pathOptions)
    switch (op) {
    case RestCommands.put:
      return await this.trelloRequest.put(options)

    case RestCommands.post:
      return await this.trelloRequest.post(options)

    default:
      throw new TypeError(`Unexpected type for test operation:${op}`)
    }
  }
  /** wrap the underlying makeRequest for put
   * @example  put({path:getCardPrefixWithId(<cardId>), options:{dueComplete: true}})
   */
  public async put(pathOptions: IPathOptionsType): IRestPromise {
    return await this.putOrPost(pathOptions, RestCommands.put)
  }

  /**
  * Wrap the underlying makeRequest for post
  * @example post({path:this.getBaseCardCmd(), options:{name:'card name', description:'some desc., idList:<idOfList>}})
  */
  public async post(pathOptions: IPathOptionsType): IRestPromise {
    return await this.putOrPost(pathOptions, RestCommands.post)
  }

  // --------------------------------------------------------------------------
  // Some pass through functions to TrelloRequest
  /**
   * Turn on full responses for the http command responses. Intended for debugging
   * troubleshooting only at this point as it hasn't been tested.
   * @param {boolean} enable - set to true to enable full response (off by default)
   */
  public enableFullResponse(enable: boolean): void {
    this.trelloRequest.doFullResponse = enable
  }

  public isInFullResponseMode(): boolean {
    return this.trelloRequest.doFullResponse
  }
  // --------------------------------------------------------------------------

  /**
   *  turn {path, options} into {path, body}
   */
  private createBodyOptions(pathOptions: IPathOptionsType): IPathBodyType {
    tv.validatePathOptions(pathOptions)
    const {path, options} = pathOptions
    return {path, body: options}
  }

  public static getRateLimitError(): number {
    return TrelloRequest.getRateLimitError()
  }

  public static getRateLimitDelayMs(): number {
    return TrelloRequest.getRateLimitDelayMs()
  }


  /**
 * Find actions that indicate card was previously on the specified list name
 * @example actionWasOnList({actions,filterList:'idOfList'})
 */
  public static actionWasOnList(param: ITrelloListBefore): IDictObj[] {
    const tvObj: IValidateType = {
      obj: param,
      reqKeys: ['actions', 'filterList'],
    }
    tv.validate(tvObj)
    for (const action of param.actions) {
      tvObj.obj = action
      tvObj.reqKeys = ['data']
      tv.validate(tvObj)
    }
    return param.actions.filter((e: IListBefore): boolean => e.data.listBefore === param.filterList)
  }
}
