// @ts-check
const NodeTrello = require('node-trello')
const logger = require('./util/logger')
const authHelper = require('./util/authHelper')
const moment = require('moment')

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

/**
 * 
 * @param {string} cmd
 * @returns {Promise} 
 */
const get = (cmd) => new Promise((resolve, reject) => {
  trello_.get(cmd, (err, response) => {
    if (err) {return reject(err)}
    return resolve(response)
  })
})

const put = (cmd, params) => new Promise((resolve, reject) => {
  trello_.put(cmd, params, (err, response) => {
    if (err) {return reject(err)}
    return resolve(response)
  })
})


const post = (cmd, params) => new Promise((resolve, reject) => {
  trello_.post(cmd, params, (err, response) => {
    if (err) {return reject(err)}
    return resolve(response)
  })
})

/**
 * Get all the cards on the list with passed id
 * @param {string} listId 
 * @returns {Promise<Array.<{id:string}>>}
 * @example getListCardsFrom('8378400348')
 */
const getListCards = (listId) => {
  const cmd = getListCmd(listId)
  return get(cmd)
}

/**
 * 
 * @param {{card:Object,text:string}} cardParams 
 */
const setComment = (cardParams) => {
  const commentCmd = getCmdToSetCommentOnCard(cardParams.card)
  const params = {
    text: cardParams.text,
  }
  return post(commentCmd, params)
}

const setDueComplete = (card) => {
  const cardCmd = getCardCommand(card)
  const params = {
    dueComplete: true,
  }
  return put(cardCmd, params)
}

const setDueDate = (cardParams) => {
  const cardCmd = getCardCommand(cardParams.card)
  console.log(cardParams)
  const dueDate = moment().add(cardParams.delay.count, cardParams.delay.unit)
  const params = {
    due: dueDate,
  }
  return put(cardCmd, params)
}

/** Take the passed id and return a valid command for getting all cards on the list 
/** @protected  
 * @param {string} listId trello list id
 * @returns {string} the full string to use as a command to the the get command 
*/
const getListCmd = (listId) => `/1/lists/${listId}/cards`

/** @protected */
const getCmdToSetCommentOnCard = partialCardCmd => `${getCardCommand(partialCardCmd)}/actions/comments`

/** @protected 
 * @param {Object} card - typically a Trello card but anything with id property works
*/
const getCardCommand = card => `/1/cards/${card.id}`

module.exports = {
  init,
  get,
  put,
  post,
  getListCards,
  setComment,
  setDueComplete,
  setDueDate,

}
