const rpn = require('request-promise-native')


class TrelloRequest {
  /** @param {{key:string,token:string}} keyTokenPair  */
  constructor(keyTokenPair) {
    this.key = keyTokenPair.key
    this.token = keyTokenPair.token
    this.uri = 'https://api.trello.com'
    this.doFullResponse = false
  }
  /** @returns the Trello api error when the rate is exceeded */
  static get RATE_LIMIT_ERROR() {return 429}
  /** @returns the suggested delay in MS based on 2X the API docs
   * http://help.trello.com/article/838-api-rate-limits
  */
  static get RATE_LIMIT_DELAY_MS() {return 200}

  /** 
   * @param {boolean} value set to true if you want the full request
   * The caller will need to specify the result.resultCode or result.body
   * or any other parameter needed
   */
  set enableFullResponse(value) {
    this.doFullResponse = value
  }

  /**
   * Get the key/token pair - internal helper function
   * @private 
   */
  _getAuthObj() {
    return {key: this.key, token: this.token}
  }

  /**
   * Send a get command
   * @param {{path:string,options:object}} getOptions 
   * @returns {rpn.RequestPromise<object>} the promise resolves to a json object 
   */
  get(getOptions) {
    const {path, options} = getOptions
    const auth = this._getAuthObj()
    const fullQs = {...auth, ...options} // combine options with auth for query string
    const rpnOptions = {
      uri: `${this.uri}${path}`,
      qs: fullQs,
      json: true,
      resolveWithFullResponse: this.doFullResponse,
    }
    return rpn.get(rpnOptions)
  }

  /**
   * Send a put command
   * @param {{path:string, body:object}} putOptions 
   * @returns {rpn.RequestPromise<object>} the promise resolves to a json object 
   */
  put(putOptions) {
    const {path, body} = putOptions
    const rpnOptions = {
      uri: `${this.uri}${path}`,
      body,
      qs: this._getAuthObj(),
      json: true,
      resolveWithFullResponse: this.doFullResponse,
    }
    return rpn.put(rpnOptions)
  }


  /**
   * Send a post command
   * @param {{path:string, body:object}} postOptions 
   * @returns {rpn.RequestPromise<object>} the promise resolves to a json object 
   */
  post(postOptions) {
    const {path, body} = postOptions
    const rpnOptions = {
      uri: `${this.uri}${path}`,
      body,
      qs: this._getAuthObj(),
      json: true,
      resolveWithFullResponse: this.doFullResponse,
    }
    return rpn.post(rpnOptions)
  }


  /**
   * Send a delete command
   * @param {{path:string, options:object}} deleteOptions 
   * @returns {rpn.RequestPromise<object>} the promise resolves to a json object 
   */
  delete(deleteOptions) {
    const {path, options} = deleteOptions
    const rpnOptions = {
      uri: `${this.uri}${path}`,
      options,
      qs: this._getAuthObj(),
      resolveWithFullResponse: this.doFullResponse,
      json: true,
    }
    return rpn.delete(rpnOptions)
  }


  // sendRequest(sr) {
  //   const {rpnFunc, path, options} = sr

  //   const rpnOptions = {
  //     uri: path,
  //     options,
  //     qs: this._getAuthObj(),
  //     // resolveWithFullResponse: true,
  //   }
  //   return rpnFunc(rpnOptions)
  // }
}

module.exports = TrelloRequest