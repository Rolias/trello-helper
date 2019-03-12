const envCreate = require('env-create')
const trello = require('./trello')

const auth = (path) => {
  envCreate.load({path})
}
module.exports = {
  auth,
  trello,
}
