const NodeTrello = require('node-trello')
const logger = require('./util/logger')
const authHelper = require('./util/authHelper')

// let getP
let trello_
let appKey
let token

const init = (nodeTrelloParam = null) => {
  if (trello_ === undefined && nodeTrelloParam === null) {
    logger.debug('Normal Trello init')
    appKey = authHelper.getAppKey()
    token = authHelper.getToken()
    trello_ = new NodeTrello(appKey, token)
  } else if (nodeTrelloParam != null) {
    logger.debug('Test Trello init')
    trello_ = nodeTrelloParam
  }
}

const get = (cmd) => new Promise((resolve, reject) => {
  trello_.get(cmd, (err, response) => {
    if (err) {return reject(err)}
    return resolve(response)
  })
})

const put = (cmd) => new Promise((resolve, reject) => {
  trello_.put(cmd, (err, response) => {
    if (err) {return reject(err)}
    return resolve(response)
  })
})

const post = (cmd) => new Promise((resolve, reject) => {
  trello_.post(cmd, (err, response) => {
    if (err) {return reject(err)}
    return resolve(response)
  })
})

/**
 * Get all the cards on the list with passed id
 * @param {string} listId 
 * @example getListCardsFrom('8378400348')
 */
const getListCards = (listId) => {
  const cmd = getListCmd(listId)
  return get(cmd)
}

/** Destructure the listId object property */
/** @protected  */
const getListCmd = (listId) => `/1/lists/${listId}/cards`

module.exports = {
  init,
  get,
  put,
  post,
  getListCards,

}
