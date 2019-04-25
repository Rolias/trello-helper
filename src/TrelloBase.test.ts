import * as  chai from 'chai'
chai.should()
import * as sinon from 'sinon'
const sandbox = sinon.createSandbox()
import TrelloBase from './TrelloBase'
import * as  utils from'./util/utils'
import {logger} from './util/logger'
import {pathToCreds} from './test-data/testDataConst'
import TrelloRequest from './TrelloRequest'
import { RestCommands } from './Interfaces';
const FAKE_ID = '12345'


const trelloBase = new TrelloBase(pathToCreds)
const status429 = {

  statusCode: 429,

}
// NOTE - We need very few tests since testing the classes that extend TrelloBase
// tests most of the functionality of TrelloBase
describe('TrelloBase Unit Tests', () => {
  let getStub: sinon.SinonStub
  before(() => {
    getStub = sandbox.stub(TrelloRequest.prototype, 'get').rejects(status429)
    sandbox.stub(utils, 'delay').resolves()
    sandbox.stub(logger, 'error')
    sandbox.spy(TrelloBase, 'getRateLimitError')
    sandbox.spy(TrelloBase, 'getRateLimitDelayMs')
  })

  after(() => {
    sandbox.restore()
  })
  it('get() should make multiple attempts when rate error returned', async () => {
    await trelloBase.get({path: FAKE_ID, options: {}})
      .catch(error => {
        console.log('caught', error)
      })
    getStub.callCount.should.be.gt(4)
    // @ts-ignore
    TrelloBase.getRateLimitError.called.should.be.true
    // @ts-ignore
    TrelloBase.getRateLimitDelayMs.called.should.be.true
  })

  it('putOrPost() should throw when invalid op passed', async () => {
    const options = {path: FAKE_ID, options: {}}
    await trelloBase.putOrPost(options, 'invalid' as RestCommands)
      .catch(error => {
        error.message.should.equal('Unexpected type for test operation:invalid')
      })
  })
})