import { IPathBodyType, IOptionsOrBodyType, IDefaultRestOption } from './Interfaces';

import * as rpn from 'request-promise-native'
import * as tv from './typeValidate'
const {OptionsBodyEnum} = require('./Interfaces')

export default class TrelloRequest {
  key: string
  token: string
  uri: string
  doFullResponse: boolean
  /** @param {{key:string,token:string}} keyTokenPair  */
  constructor(keyTokenPair) {
    tv.validate({obj: keyTokenPair, reqKeys: ['key', 'token']})
    this.key = keyTokenPair.key
    this.token = keyTokenPair.token
    this.uri = 'https://api.trello.com'

    // set doFullResponse to true if you want the full request
    // The caller will need to specify the result.resultCode or result.body
    // or any other property needed on the returned object
    this.doFullResponse = false
  }
  /** @returns the Trello api error when the rate is exceeded */
  static getRateLimitError() {return 429}
  /** @returns the suggested delay in MS based on 2X the API docs
   * http://help.trello.com/article/838-api-rate-limits
  */
  static getRateLimitDelayMs() {return 500}

  /**
   * Get the key/token pair - internal helper function
   * @private
   * @returns {{key:string, token:string}}
   */
  _getAuthObj() {
    return {key: this.key, token: this.token}
  }

  /**
   * Send a get command
   * @param {{path:string,options:object}} getOptions
   * @returns {rpn.RequestPromise<object>} the promise resolves to a json object
   * @example get(path:'/1/lists/123',options:{limit:10})
   */
  get(getOptions) {
    tv.validateOptionsOrBody(getOptions, OptionsBodyEnum.options)
    const {path, options} = getOptions
    const rpnOptions = this.setupDefaultOption(path)
    const auth = this._getAuthObj()
    const fullQs = {...auth, ...options} // combine options with auth for query string
    rpnOptions.qs = fullQs
    return rpn.get(rpnOptions)
  }

  /**
   * Send a put command
   * @param {{path:string, body:object}} putOptions
   * @returns {rpn.RequestPromise<object>} the promise resolves to a json object
   * @example put({path:' '/1/cards'/123}, body:{dueComplete:true}})
   */
  put(putOptions) {
    const rpnOptions = this._setupPutPostOptions(putOptions)
    return rpn.put(rpnOptions)
  }

  /**
   * Send a post command
   * @param {{path:string, body:object}} postOptions
   * @returns {rpn.RequestPromise<object>} the promise resolves to a json object
   * @example post({path:'1/cards',body:{name:'card name'}})
   */
  post(postOptions) {
    const rpnOptions = this._setupPutPostOptions(postOptions)
    return rpn.post(rpnOptions)
  }

  /**
   * Send a delete command
   * @param {{path:string, options:object}} deleteOptions
   * @returns {rpn.RequestPromise<object>} the promise resolves to a json object
   * @example delete(path:'/1/cards/<id>' ,options:{})
   */
  delete(deleteOptions) {
    tv.validateOptionsOrBody(deleteOptions, OptionsBodyEnum.options)
    const {path, options} = deleteOptions
    const rpnOptions = this.setupDefaultOption(path)
    rpnOptions.options = options
    return rpn.delete(rpnOptions)
  }

  /**
   * The post and put set up an identical options object
   * based on the body property of the options.
   * @private
   * @param {{path:string, body:string}} options
   * @example setupPutPostOptions({path:string, body:object})
   */
  _setupPutPostOptions(options:IPathBodyType) {
    tv.validateOptionsOrBody(options, OptionsBodyEnum.body)
    const {path, body} = options
    const rpnOptions = this.setupDefaultOption(path)
    rpnOptions.body = body
    return rpnOptions
  }

  /**
   * @typedef defaultRestOption {object}
   * @property {string} uri
   * @property {{key:string, token:string}} qs
   * @property {boolean} json
   * @property {boolean} resolveWithFullResponse
   * @property {string=} options
   * @property {object=} body
   */
  /**
   * Set up the the most common set of options used by all verbs
   * Each function can override the ones that vary. For example the qs property
   * will get overwritten for get commands since options get added to the auth values
   * @param {string} path
   * {{uri:string, qs:tv.keyTokenType, json:boolean, resolveWithFullResponse:boolean, options=:string, body=:any}}
   * @returns {defaultRestOption}
   * @example setDefaultOption(path)
   */
  setupDefaultOption(path:string):IDefaultRestOption {
    return {
      uri: `${this.uri}${path}`,
      qs: this._getAuthObj(),
      json: true,
      resolveWithFullResponse: this.doFullResponse,
    }
  }
}
