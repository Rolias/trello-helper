const envCreate = require('env-create')
const logger = require('./util/logger')
const trello = require('./trello')
logger.info('hello trello world!')

const auth = (path) => {
  envCreate.load({path})
}
module.exports = {
  auth,
  trello,
}
