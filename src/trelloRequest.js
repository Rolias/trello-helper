const rpn = require('request-promise-native')

class TrelloRequest {
  /** @param {{key:string,token:string}} keyTokenPair  */
  constructor(keyTokenPair) {
    this.key = keyTokenPair.key
    this.token = keyTokenPair.token
    this.uri = 'https://api.trello.com'
    this.doFullResponse = false
  }

  static get RATE_LIMIT_ERROR() {return 429}
  static get RATE_LIMIT_DELAY_MS() {return 200}

  set enableFullResponse(value) {
    this.doFullResponse = value
  }
  getAuthObj() {
    return {key: this.key, token: this.token}
  }

  // resolveWithFullResponse

  get(getOptions) {
    const {path, options} = getOptions
    const auth = this.getAuthObj()
    const fullQs = {...auth, ...options} // combine options with auth for query string
    const rpnOptions = {
      uri: `${this.uri}${path}`,
      qs: fullQs,
      json: true,
      resolveWithFullResponse: this.doFullResponse,
    }
    return rpn.get(rpnOptions)
  }

  put(putOptions) {
    const {path, body} = putOptions
    const rpnOptions = {
      uri: `${this.uri}${path}`,
      body,
      qs: this.getAuthObj(),
      json: true,
      resolveWithFullResponse: this.doFullResponse,
    }
    return rpn.put(rpnOptions)
  }


  post(postOptions) {
    const {path, body} = postOptions
    const rpnOptions = {
      uri: `${this.uri}${path}`,
      body,
      qs: this.getAuthObj(),
      json: true,
      resolveWithFullResponse: this.doFullResponse,
    }
    return rpn.post(rpnOptions)
  }


  delete(deleteOptions) {
    const {path, options} = deleteOptions
    const rpnOptions = {
      uri: `${this.uri}${path}`,
      options,
      qs: this.getAuthObj(),
      resolveWithFullResponse: this.doFullResponse,
      json: true,
    }
    return rpn.delete(rpnOptions)
  }


  sendRequest(sr) {
    const {rpnFunc, path, options} = sr

    const rpnOptions = {
      uri: path,
      options,
      qs: this.getAuthObj(),
      // resolveWithFullResponse: true,
    }
    return rpnFunc(rpnOptions)
  }
}

module.exports = TrelloRequest