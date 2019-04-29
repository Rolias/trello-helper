import * as I from './Interfaces'
import * as Enum from './enums'

import * as tv  from  './typeValidate'
import {TrelloRequest}  from './TrelloRequest'
import * as envCreate  from 'env-create'
import {logger} from './util/logger'
import * as utils from './util/utils'


export class TrelloBase {
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
  public static getCustomFieldUpdateCmd(cfp: I.CardFieldType): string {
    tv.validate({obj: cfp, reqKeys: ['cardId', 'fieldId']})
    return `/1/cards/${cfp.cardId}/customField/${cfp.fieldId}/item`
  }

  /**
  * Wrap the underlying makeRequest for get
  * @example get({path:this.getListCardCmd('123'),options: {limit:10}})
  */
  public async get(pathOptions: I.PathOptionsType): I.RestPromise {
    tv.validatePathOptions(pathOptions)
    const responseStr = await this.trelloRequest.get(pathOptions)
      .catch(async (error: I.DictObj): I.RestPromise => {
        if (error.statusCode === TrelloBase.getRateLimitError()) {
          if (this.retryCounter++ > 4) {
            throw new Error('Rate limit error hit too many times. Giving up.')
          }
          logger.error('Rate limit error - retrying...')
          await utils.delay(TrelloBase.getRateLimitDelayMs())
          await this.get(pathOptions)
          // .catch((error): void => {
          //   console.log(`Nested Catch ${JSON.stringify(error, null, 2)}`)
          // })
        }
        else {
          throw error
        }
      })
    this.retryCounter = 0
    return responseStr as I.DictObj[]
  }

  /** wrap the underlying makeRequest for delete
  * @example  delete(getCardPrefixWithId(<cardId>)})
  */
  public async delete(pathOptions: I.PathOptionsType): I.RestPromise {
    tv.validatePathOptions(pathOptions)
    return await this.trelloRequest.delete(pathOptions)
  }

  public async putOrPost(pathOptions: I.PathOptionsType, op: Enum.RestCommands): I.RestPromise {
    const options = this.createBodyOptions(pathOptions)
    switch (op) {
    case Enum.RestCommands.Put:
      return await this.trelloRequest.put(options)

    case Enum.RestCommands.Post:
      return await this.trelloRequest.post(options)

    default:
      throw new TypeError(`Unexpected type for test operation:${op}`)
    }
  }
  /** wrap the underlying makeRequest for put
   * @example  put({path:getCardPrefixWithId(<cardId>), options:{dueComplete: true}})
   */
  public async put(pathOptions: I.PathOptionsType): I.RestPromise {
    return await this.putOrPost(pathOptions, Enum.RestCommands.Put)
  }

  /**
  * Wrap the underlying makeRequest for post
  * @example post({path:this.getBaseCardCmd(), options:{name:'card name', description:'some desc., idList:<idOfList>}})
  */
  public async post(pathOptions: I.PathOptionsType): I.RestPromise {
    return await this.putOrPost(pathOptions, Enum.RestCommands.Post)
  }

  /**
   *  turn {path, options} into {path, body}
   */
  private createBodyOptions(pathOptions: I.PathOptionsType): I.PathBodyType {
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
  public static actionWasOnList(param: I.TrelloListBefore): I.DictObj[] {
    const tvObj: I.ValidateType = {
      obj: param,
      reqKeys: ['actions', 'filterList'],
    }
    tv.validate(tvObj)
    for (const action of param.actions) {
      tvObj.obj = action
      tvObj.reqKeys = ['data']
      tv.validate(tvObj)
    }
    return param.actions.filter((e: I.ListBefore): boolean => e.data.listBefore === param.filterList)
  }
}
