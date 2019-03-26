const keytar = require('keytar')
const inquirer = require('inquirer')

const API_KEY = 'apiKey'
const TOKEN = 'token'

class CredentialManager {
  constructor() {
    this.service = process.env.npm_package_name
  }

  /**
 * Reads the apiKey and token from the user's credential manager software or 
 * prompts for them if they don't exist. 
 * @returns {Promise<{apiKey, token}>}
 */
  async getOrCreateKeyAndToken() {
    const apiKey = await keytar.getPassword(this.service, API_KEY)
    const token = await keytar.getPassword(this.service, TOKEN)
    if (apiKey === null || token === null) {
      return this.createKeyAndToken()
    }
    return {apiKey, token}
  }

  async createKeyAndToken() {
    const response = await inquirer.prompt([
      {type: 'input', name: 'apiKey', message: 'Enter your Trello Api Key'},
      {type: 'password', name: 'token', message: 'Enter your Trello Token'}
    ])
    const {apiKey, token} = response
    keytar.setPassword(this.service, API_KEY, apiKey)
    keytar.setPassword(this.service, TOKEN, token)
    return response
  }
}
module.exports = CredentialManager