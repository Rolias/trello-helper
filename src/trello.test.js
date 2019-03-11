const chai = require('chai')
chai.should()
// const sandbox = require('sinon').createSandbox()
const trello = require('./trello')
const FAKE_ID = '12345'
const FAKE_COMMENT = 'Message for Comment'
const rejectTrello = {

  get(cmd, cb) {cb('get rejected', null)},
  post(cmd, params, cb) {cb('post rejected', null)},
  put(cmd, params, cb) {cb('put rejected', null)},
}

const fakeTrello = {
  get(cmd, cb) {cb('', {cmd})},
  put(cmd, params, cb) {cb('', {type: 'put', cmd, params})},
  post(cmd, params, cb) {cb('', {type: 'post', cmd, params})},
}

describe('trello ', () => {})
{
  describe('trello using reject ', () => {
    before(() => {
      trello.init(rejectTrello)
    })

    describe('get () should', () => {})
    it('reject', async () => {
      let assertCount
      await trello.get('a fake command')
        .catch((error) => {
          error.should.contain('get rejected')
          assertCount = 1
        })
      assertCount.should.equal(1)
    })
    describe('getListCards () should', () => {})
    it('reject', async () => {
      let assertCount
      await trello.getListCards('a fake command')
        .catch((error) => {
          error.should.contain('get rejected')
          assertCount = 1
        })
      assertCount.should.equal(1)
    })
  })

  describe('trello with fake', () => {
    before(() => {
      trello.init(fakeTrello)
    })
    it('getListCards() should return id', async () => {
      const result = await trello.getListCards(FAKE_ID)
      result.cmd.should.contain(FAKE_ID)
    })

    it('setComment() should return something', async () => {
      const cardParams = {card: {id: FAKE_ID}, text: FAKE_COMMENT}
      const result = await trello.setComment(cardParams)
      result.type.should.equal('post')
      result.cmd.should.contain(FAKE_ID)
      result.params.text.should.contain(FAKE_COMMENT)
    })
  })
}