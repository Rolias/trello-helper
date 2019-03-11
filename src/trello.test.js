const chai = require('chai')
chai.should()
// const sandbox = require('sinon').createSandbox()
const trello = require('./trello')
const FAKE_ID = '12345'
const rejectTrello = {

  get(cmd, cb) {cb('get rejected', null)},
  post(cmd, params, cb) {cb('post rejected', null)},
  put(cmd, params, cb) {cb('put rejected', null)},
}

const fakeTrello = {
  get(cmd, cb) {cb('', {cmd})},
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
    it('should...', async () => {
      const result = await trello.getListCards(FAKE_ID)
      result.cmd.should.contain(FAKE_ID)
    })
  })
}