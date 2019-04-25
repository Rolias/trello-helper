import * as I from './Interfaces'
import * as rpn from 'request-promise-native'
import * as tv from './typeValidate'
import * as Enum from './enums'

export default class TrelloRequest {
  private key: string
  private token: string
  private uri: string
  private _doFullResponse: boolean

  public constructor(keyTokenPair: I.IKeyTokenType)  {
    tv.validate({obj: keyTokenPair, reqKeys: ['key', 'token']})
    this.key = keyTokenPair.key
    this.token = keyTokenPair.token
    this.uri = 'https://api.trello.com'

    // set doFullResponse to true if you want the full request
    // The caller will need to specify the result.resultCode or result.body
    // or any other property needed on the returned object
    this._doFullResponse = false
  }

  public get doFullResponse(): boolean {
    return this._doFullResponse
  }

  public set doFullResponse(value: boolean) {
    this._doFullResponse = value
  }

  /** returns the Trello api error when the rate is exceeded */
  public static getRateLimitError(): number {return 429}
  /** returns a suggested delay in MS for more info see the  API docs
   * http://help.trello.com/article/838-api-rate-limits
  */
  public static getRateLimitDelayMs(): number {return 500}

  /**
   * Get the key/token pair - internal helper function
   */
  private getAuthObj(): I.IKeyTokenType {
    return {key: this.key, token: this.token}
  }

  /**
   * Send a get command
   * @example get(path:'/1/lists/123',options:{limit:10})
   */
  public get(getOptions: I.IPathOptionsType): rpn.RequestPromise<I.IDictObj[]> {
    tv.validateOptionsOrBody(getOptions, Enum.OptionsBody.options)
    const {path, options} = getOptions
    const rpnOptions = this.setupDefaultOption(path)
    const auth = this.getAuthObj()
    const fullQs = {...auth, ...options} // combine options with auth for query string
    rpnOptions.qs = fullQs
    return rpn.get(rpnOptions)
  }

  /**
   * Send a put command
   * @example put({path:' '/1/cards'/123}, body:{dueComplete:true}})
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public put(putOptions: I.IPathBodyType): rpn.RequestPromise<any> {
    const rpnOptions = this._setupPutPostOptions(putOptions)
    return rpn.put(rpnOptions)
  }

  /**
   * Send a post command
   * @example post({path:'1/cards',body:{name:'card name'}})
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public post(postOptions: I.IPathBodyType): rpn.RequestPromise<any> {
    const rpnOptions = this._setupPutPostOptions(postOptions)
    return rpn.post(rpnOptions)
  }

  /**
   * Send a delete command
   * @example delete(path:'/1/cards/<id>' ,options:{})
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public delete(deleteOptions: I.IPathOptionsType): rpn.RequestPromise<any> {
    tv.validateOptionsOrBody(deleteOptions, Enum.OptionsBody.options)
    const {path, options} = deleteOptions
    const rpnOptions = this.setupDefaultOption(path)
    rpnOptions.options = options
    return rpn.delete(rpnOptions)
  }

  /**
   * The post and put set up an identical options object
   * based on the body property of the options.
   * @example setupPutPostOptions({path:string, body:object})
   */
  private _setupPutPostOptions(options: I.IPathBodyType): I.IDefaultRestOption {
    tv.validateOptionsOrBody(options, Enum.OptionsBody.body)
    const {path, body} = options
    const rpnOptions = this.setupDefaultOption(path)
    rpnOptions.body = body
    return rpnOptions
  }

  /**
   * Set up the the most common set of options used by all verbs
   * Each function can override the ones that vary. For example the qs property
   * will get overwritten for get commands since options get added to the auth values
   * @example setDefaultOption(path)
   */
  public setupDefaultOption(path: string): I.IDefaultRestOption {
    return {
      uri: `${this.uri}${path}`,
      qs: this.getAuthObj(),
      json: true,
      resolveWithFullResponse: this._doFullResponse,
    }
  }
}
