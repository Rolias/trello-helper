const envCreate = require('env-create')
const trello = require('./src/trello_old')

const auth = (path) => {
  envCreate.load({path})
}
module.exports = {
  auth,
  trello,
}
