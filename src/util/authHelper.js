

let initialized = false
let trelloAuth

/** One time initialization to load credentials. 
 * User of the library should have passed in path to .json file with credentials
 * to the main auth() function and set up the process.env with `trelloHelper` 
 * That object should in turn have two properties: `appKey` and `token`
*/
const init = () => {
  if (process.env.trelloHelper === undefined) {
    throw ("FATAL ERROR: environment variable with credentials is missing")
  }
  trelloAuth = JSON.parse(process.env.trelloHelper)
  initialized = true
}

const getAppKey = () => {
  if (!initialized) {init()}
  return trelloAuth.appKey
}

const getToken = () => {
  if (!initialized) {init()}
  return trelloAuth.token
}

module.exports = {
  getAppKey,
  getToken,
}

