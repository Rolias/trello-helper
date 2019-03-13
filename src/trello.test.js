const chai = require('chai')
const should = chai.should()
const moment = require('moment')
const baseTrello = require('trello')


const sandbox = require('sinon').createSandbox()
const Trello = require('./trello')
const FAKE_ID = '12345'
const FAKE_COMMENT = 'Message for Comment'


const trello = new Trello('./src/test-data/unit-test-fake-credentials.json')
const fakeCmd = 'fake command'
const rejectMsg = 'rejected'
const resolveObj = '{id:"123"}'
const resolveArray = [{id: '123'}]
let myStub
const stubPathParam = () => myStub.getCall(0).args[1]
const stubOptionParam = () => myStub.getCall(0).args[2]
describe('trello ', () => {})
{
  xit('should ...', () => {
    sandbox.stub(baseTrello.prototype, 'makeRequest').returns(Promise.resolve())
    // actual test goes here
    sandbox.restore()
  })
  describe('trello using reject ', () => {
    beforeEach(() => {
      sandbox.stub(baseTrello.prototype, 'makeRequest').returns(Promise.reject(rejectMsg))
    })
    afterEach(() => {
      sandbox.restore()
    })

    it('get() should reject', async () => {
      await trello.get(fakeCmd)
        .catch((error) => {
          error.should.equal(rejectMsg)
        })
    })

    // describe('getListCards () should', () => {})
    it('getCardsOnList() should reject', async () => {
      await trello.getCardsOnList(fakeCmd)
        .catch((error) => {
          error.should.equal(rejectMsg)
        })
    })
  })

  describe('trello with fake', () => {
    beforeEach(() => {
      myStub = sandbox.stub(baseTrello.prototype, 'makeRequest')
        .returns(Promise.resolve(resolveArray))
    })

    afterEach(() => {
      sandbox.restore()
    })

    it.only('getListCards() should return id', async () => {
      const result = await trello.getCardsOnList({fromId: FAKE_ID})
      result[0].id.should.equal('123')
      stubPathParam().should.contain(FAKE_ID)
      should.not.exist(stubOptionParam())
    })

    it.only('setComment() should return something', async () => {
      const cardParams = {card: {id: FAKE_ID}, text: FAKE_COMMENT}
      await trello.addCommentOnCard(cardParams)
      stubPathParam().should.contain(FAKE_ID)
      stubOptionParam().should.contain(FAKE_COMMENT)
    })
    it('setDueDate() should create due date with time specified', async () => {
      const cardParams = {card: {id: FAKE_ID}, time: {count: 2, units: 'days'}}
      const result = await Trello.setDueDate(cardParams)
      result.type.should.equal('put')
      result.cmd.should.contain(FAKE_ID)
      moment.isMoment(result.params.due).should.be.true
    })
  })
}