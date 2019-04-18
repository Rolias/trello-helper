const tv = require('./typeValidate')
const TrelloRequest = require('./trelloRequest')
const envCreate = require('env-create')
const logger = require('./util/logger')
const utils = require('./util/utils')

class TrelloBase {

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
  /** @return {string} '/1/cards'  */
  static getBaseCardCmd() {return '/1/cards'}

  /** 
   * @param {string} cardId 
   * @return {string} '/1/cards/[cardId]' */
  static getCardPrefixWithId(cardId) {return `${TrelloBase.getBaseCardCmd()}/${cardId}`}
  /** 
   * @param {string} cardId 
   * @return {string} '/1/cards/[cardId]/due' */
  static getCardDueCmd(cardId) {return `${TrelloBase.getCardPrefixWithId(cardId)}/due`}
  /** 
   * @param {string} listId 
   * @return {string} '/1/lists/[listId]' */
  static getListPrefixWithId(listId) {return `/1/lists/${listId}`}
  /** 
   * @param {string} listId 
   * @return {string} '/1/lists/[listId]/cards */
  static getListCardCmd(listId) {return `${TrelloBase.getListPrefixWithId(listId)}/cards`}
  /**
   * @param {string} boardId 
   * @return {string} '/1/boards/[boardId]' */
  static getBoardPrefixWithId(boardId) {return `/1/board/${boardId}`}

  /** @param {tv.cardFieldType} cfp - the Card Field Parameter*/
  static getCustomFieldUpdateCmd(cfp) {
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
  async get(pathOptions) {
    const getOptions = this.createGetDeleteOptions(pathOptions)
    const responseStr = await this.trelloRequest.get(getOptions)
      .catch(async error => {
        if (error.statusCode === TrelloBase.getRateLimitError()) {
          logger.error('Rate limit error - retrying...')
          await utils.delay(TrelloBase.getRateLimitDelayMs())
          this.get(pathOptions)
        }
        else {
          throw error
        }
      })
    return responseStr
  }

  /** wrap the underlying makeRequest for delete 
  * @param {object} pathOptions  technically an http path but to the Trello API it's a command 
  * @param {string} pathOptions.path
  * @param {object} pathOptions.options
  * @return {Promise<any>}
  * @example  delete(getCardPrefixWithId(<cardId>)})
  */
  async delete(pathOptions) {
    const deleteOptions = this.createGetDeleteOptions(pathOptions)
    return await this.trelloRequest.delete(deleteOptions)
  }

  /**
   * crate the  object needed by the get and delete calls
   * @param {{path:string,options:string}} pathOptions 
   */
  createGetDeleteOptions(pathOptions) {
    tv.validatePathOptions(pathOptions)
    const {path, options} = pathOptions
    return {
      path,
      options,
    }
  }

  /** wrap the underlying makeRequest for put 
   * @param {object} pathOptions  technically an http path but to the Trello API it's a command 
   * @param {string} pathOptions.path
   * @param {object} pathOptions.options
   * @return {Promise<any>}
   * @example  put({path:getCardPrefixWithId(<cardId>), options:{dueComplete: true}})
   */
  async put(pathOptions) {
    const putOptions = this.createPutAndPostOptions(pathOptions)
    return await this.trelloRequest.put(putOptions)
  }

  /**
  * Wrap the underlying makeRequest for post
   * @param {object} pathOptions  technically an http path but to the Trello API it's a command 
   * @param {string} pathOptions.path
   * @param {object} pathOptions.options
  * @return {Promise<any>}
  * @example post({path:this.getBaseCardCmd(), options:{name:'card name', description:'some desc., idList:<idOfList>}})
  */
  async post(pathOptions) {
    const postOptions = this.createPutAndPostOptions(pathOptions)
    return await this.trelloRequest.post(postOptions)
  }

  createPutAndPostOptions(pathOptions) {
    tv.validatePathOptions(pathOptions)
    const {path, options} = pathOptions
    return {
      path,
      body: options,
    }
  }


  // --------------------------------------------------------------------------
  // Some pass through functions to TrelloRequest
  /**
   * Turn on full responses for the http command responses. Intended for debugging
   * troubleshooting only at this point as it hasn't been tested.
   * @param {boolean} enable - set to true to enable full response (off by default) 
   */
  enableFullResponse(enable) {
    this.trelloRequest.doFullResponse = enable
  }

  isInFullResponseMode() {
    return this.trelloRequest.doFullResponse
  }

  // --------------------------------------------------------------------------


  static getRateLimitError() {
    return TrelloRequest.getRateLimitError()
  }

  static getRateLimitDelayMs() {
    return TrelloRequest.getRateLimitDelayMs()
  }


  /**
 * Find actions that indicate card was previously on the specified list name
 * @param {object} param
 * @param {object[]} param.actions
 * @param {object} param.actions[].data
 * @param {string} param.actions[].data.listBefore
 * @param {string} param.filterList 
 * @return {Array<Object>} the array of actions that fit the criteria
 * @example actionWasOnList({actions,filterList:'idOfList'})
 */
  static actionWasOnList(param) {
    /** @type tv.validateType */
    const tvObj = {
      obj: param,
      reqKeys: ['actions', 'filterList'],
    }
    tv.validate(tvObj)
    for (const action of param.actions) {
      tvObj.obj = action
      tvObj.reqKeys = ['data']
      tv.validate(tvObj)
    }
    return param.actions.filter(e => e.data.listBefore === param.filterList)
  }


}

/** 
 *  A static helper enumeration so users don't have to hard code magic strings
 * @static
*/
TrelloBase.customFieldType = {
  /** @type {string} */
  list: 'list', // this one gets special handling
  text: 'text',
  number: 'number', // still takes a string as a value
  date: 'date', // also takes a string
  checkbox: 'checked', // takes a string of 'true' or 'false'
}

module.exports = TrelloBase