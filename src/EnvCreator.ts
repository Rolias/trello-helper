import * as I from './Interfaces'
import * as envCreate  from 'env-create'
import {logger} from './util/logger'
/**
 * Either create an environment variable that holds the Trello App and Tokens
 * or just return if the user specifies that the environment var already exists
 * Preexisting env vars may be needed for certain hosting environments
 */

export class EnvVarCreator {
  public static create(param?:I.TrelloConstructorParam):void {
    // If the user says the environment variable exists then we're done.
    if (param !== undefined) {
      if (param.useExistingEnvVar) {
        return
      }
    }
    // An empty path string just means use .env.json so that's OK but
    // if a path is supplied we want to use that
    const pathParam = {path:''}
    if (param !== undefined) {
      pathParam.path = param.path || ''
    }
    this.createFromFile(pathParam)
  }

  private static createFromFile(param:{path:string}):void {
    const result = envCreate.load(param)
    console.log('>>>', process.env.trelloHelper)
    if (result.status === false) {
      const errorMsg = `FATAL ERROR reading credentials. ${JSON.stringify(result, null, 2)}`
      logger.error(errorMsg)
      throw errorMsg
    }
  }
}