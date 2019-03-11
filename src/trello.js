
require("env-create").load({
  path: "/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json",
  debug: "true",
})
const NodeTrello = require("node-trello")
const creds = require("../_local/trello-credentials")
const util = require("util")
const logger = require("./util/logger")
//const nodeTrello = new NodeTrello(creds.appKey, creds.token)



let getP
let putP
let postP
let trello_
const appKey = JSON.parse(process.env.appKey)
const token = JSON.parse(process.env.token)


const init = (nodeTrelloParam = null) => {
  if (trello_ === undefined && nodeTrelloParam === null) {
    logger.debug("Normal Trello init")
    trello_ = new NodeTrello(appKey, token)
    getP = util.promisify(trello_.get)
    putP = util.promisify(trello_.put)
    postP = util.promisify(trello_.post)
  } else if (nodeTrelloParam != null) {
    logger.debug("Test Trello init")
    trello_ = nodeTrelloParam
    // assume andy trello fake we pass in uses promises
    getP = trello_.get
    putP = trello_.put
    postP = trello.post
  }
}

const get = async (cmd) => await getP(cmd)
const put = async (cmd, params) => await putP(cmd, params)
const post = async (cmd, params) => await postP(cmd, params)
const getCardsFromListIdCmd = listId => `/1/lists/${listId}/cards`

module.exports = {
  init,
  get,
  put,
  post,
  getCardsFromListIdCmd,
}
