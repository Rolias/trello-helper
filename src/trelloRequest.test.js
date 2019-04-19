const chai = require('chai')
chai.should()
const sinon = require('sinon')
const sandbox = sinon.createSandbox()
// const TrelloRequest = require('./trelloRequest')
const rpn = require('request-promise-native')
const TrelloRequest = require('./TrelloRequest')
const fakeCreds = {key: '123', token: 'token'}
const trelloRequest = new TrelloRequest(fakeCreds)

const TEST_PATH = '/1/cards'
const EXPECTED_URI = `https://api.trello.com${TEST_PATH}`
const {match} = sinon

describe.only('TrelloRequest Unit Tests', () => {
  before(() => {
    // @ts-ignore

  })
  after(() =>
    sandbox.restore()
  )
  describe('get() should', () => {
    let getStub
    before(async () => {
      // @ts-ignore
      getStub = sandbox.stub(rpn, 'get').returns(Promise.resolve('get done'))
      await trelloRequest.get({path: TEST_PATH, options: {limit: 10}})
    })
    it('be passed the uri property', () => {
      getStub.calledWith(match.has('uri', EXPECTED_URI)).should.be.true
    })
    it('be passed the auth object', () => {
      getStub.calledWith(match.hasNested('qs.key', '123')).should.be.true
    })
    it('be passed the limit  object', () => {
      getStub.calledWith(match.hasNested('qs.limit', 10)).should.be.true
    })
    it('be passed the json property', () => {
      getStub.calledWith(match.has('json', true)).should.be.true
    })
    it('be passed the resolveWithFullResponse property', () => {
      getStub.calledWith(match.has('resolveWithFullResponse', false)).should.be.true
    })
  })

  describe('put() should', () => {
    let putStub
    before(async () => {
      // @ts-ignore
      putStub = sandbox.stub(rpn, 'put').returns(Promise.resolve('put done'))
      await trelloRequest.put({path: TEST_PATH, body: {fields: 'name'}})
      console.log(putStub.getCall(0).args)
    })
    it('be passed the uri property', () => {
      putStub.calledWith(match.has('uri', EXPECTED_URI)).should.be.true
    })
    it('have a body object', () => {
      putStub.calledWith(match.hasNested('body', {fields: 'name'})).should.be.true
    })
  })

})