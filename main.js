const envCreate = require('env-create')
// const trello = require('./src/trello_old')
const Trello = require('./src/trello')

// const auth = (path) => {
//   envCreate.load({path})
// }
// module.exports = {
//   auth,
//   trello,
// }
module.exports = Trello