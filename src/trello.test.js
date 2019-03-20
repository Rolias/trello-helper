// @ts-check
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
const resolveArray = [{id: '123', idList: `${FAKE_ID}`}, {id: '456', idList: '789'}]
let makeRequestStub
const makeRequestStubType = () => makeRequestStub.getCall(0).args[0]
const makeRequestStubPathParam = () => makeRequestStub.getCall(0).args[1]
const makeRequestStubOptionParam = () => makeRequestStub.getCall(0).args[2]
describe('trello class', () => {})
{
  it('constructor should throw with no parameter and no local .env.json file', () => {
    // @ts-ignore
    (() => {new Trello()}).should.throw()
  })

  describe('using reject ', () => {
    beforeEach(() => {
      sandbox.stub(baseTrello.prototype, 'makeRequest').returns(Promise.reject(rejectMsg))
    })
    afterEach(() => {
      sandbox.restore()
    })

    it('get() should reject', async () => {
      // @ts-ignore
      await trello.get(fakeCmd)
        .catch((error) => {
          error.should.equal(rejectMsg)
        })
    })

    // describe('getListCards () should', () => {})
    it('getCardsOnList() should reject', async () => {
      // @ts-ignore
      await trello.getCardsOnList(fakeCmd)
        .catch((error) => {
          error.should.equal(rejectMsg)
        })
    })
  })


  describe('trello functions that return card object resolve', () => {
    beforeEach(() => {
      makeRequestStub = sandbox.stub(baseTrello.prototype, 'makeRequest')
        .returns(Promise.resolve(resolveObj))
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('addCard() should', () => {
      beforeEach(async () => {
        await trello.addCard({name: 'Test', description: 'Something', idList: FAKE_ID})
      })
      it('create expected path parameter', () => {
        makeRequestStubPathParam().should.equal('/1/cards')
      })
      it('do a post', () => {
        makeRequestStubType().should.equal('post')
      })
      it('have an  options argument with three properties', () => {
        Object.keys(makeRequestStubOptionParam()).length.should.equal(3)
      })
    })
  })

  describe('trello functions that resolve and return an array', () => {
    beforeEach(() => {
      makeRequestStub = sandbox.stub(baseTrello.prototype, 'makeRequest')
        .returns(Promise.resolve(resolveArray))
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('getCardsOnList() with id only', () => {
      beforeEach(async () => {
        await trello.getCardsOnList({id: FAKE_ID})
      })
      it('should get a proper path ', async () => {
        makeRequestStubPathParam().should.equal(`/1/list/${FAKE_ID}/cards`)
      })
      it('should not have an option parameter', async () => {
        should.not.exist(makeRequestStubOptionParam())
      })
      it('should do a get', async () => {
        makeRequestStubType().should.equal('get')
      })
    })

    describe('getCardsOnList() with id and option properties', () => {
      beforeEach(async () => {
        await trello.getCardsOnList({id: FAKE_ID, options: {limit: 10}})
      })
      it('should get a proper path ', async () => {
        makeRequestStubPathParam().should.equal(`/1/list/${FAKE_ID}/cards`)
      })
      it('should have an option parameter equal to 10', async () => {
        makeRequestStubOptionParam().limit.should.equal(10)
      })
    })

    it('addCommentOnCard() should get expected path and option object ', async () => {
      const cardParams = {id: FAKE_ID, text: FAKE_COMMENT}
      await trello.addCommentOnCard(cardParams)
      makeRequestStubPathParam().should.equal(`/1/cards/${FAKE_ID}/actions/comments`)
      makeRequestStubOptionParam().text.should.equal(FAKE_COMMENT)
    })

    it('addDueDateToCardByOffset constructs expected path and date', async () => {
      await trello.addDueDateToCardByOffset({
        id: FAKE_ID,
        offset: {count: 7, units: 'days'},
      })
      makeRequestStubPathParam().should.equal('/1/cards/12345/due')
      const dueDate = makeRequestStubOptionParam().value
      moment(dueDate).isSame(moment().add(7, 'days'), 'day')
    })

    describe('setDueComplete() should', () => {
      beforeEach(async () => {
        await trello.setDueComplete({id: FAKE_ID, isComplete: true})
      })
      it('have the  done a put()', async () => {
        makeRequestStubType().should.equal('put')
      })
      it('have the expected path', async () => {
        makeRequestStubPathParam().should.equal('/1/cards/12345')
      })
      it('have an object of {filter:"all"}', async () => {
        makeRequestStubOptionParam().dueComplete.should.be.true
      })
    })

    describe('getAllActionsOnCard() should', () => {
      beforeEach(async () => {
        await trello.getAllActionsOnCard(FAKE_ID)
      })
      it('have done a get()', async () => {
        makeRequestStubType().should.equal('get')
      })
      it('have the expected path', async () => {
        makeRequestStubPathParam().should.equal('/1/cards/12345/actions')
      })
      it('have an object of {filter:"all"}', async () => {
        makeRequestStubOptionParam().filter.should.equal('all')
      })
    })

    describe('getArchivedCards(param) should', () => {
      let result
      beforeEach(async () => {
        result = await trello.getArchivedCards({boardId: FAKE_ID, listId: FAKE_ID})
      })
      it('have the expected path', () => {
        makeRequestStubType().should.equal('get')
      })
      it('have the expected path', () => {
        makeRequestStubPathParam().should.equal('/1/board/12345/cards')
      })
      it('have an object of {filter:"closed"}', () => {
        makeRequestStubOptionParam().filter.should.equal('closed')
      })
      it('should return the action with the FAKE_ID idList ', () => {
        result.length.should.equal(1)
        result[0].idList.should.equal(FAKE_ID)
      })
    })


  })
  describe('action functions', () => {
    const listToFind = 'listOfInterest'
    const desiredType = 'commentAdded'
    const moveCardToBoardType = 'moveCardToBoard'
    const actions = [
      {
        type: moveCardToBoardType,
        data: {listBefore: 'notThisOne'},
      },
      {
        type: desiredType,
        data: {listBefore: listToFind},
      }]

    it('actionWasOnList() should find action on the desired list', async () => {
      const result = await trello.actionWasOnList({actions, filterList: listToFind})
      result.length.should.equal(1)
      result[0].data.listBefore.should.equal(listToFind)
    })

    it('filterActionsByType() should find desired type.', async () => {
      const result = await trello.filterActionsByType({actions, filterType: desiredType})
      console.log(result)
      result.length.should.equal(1)
      result[0].type.should.equal(desiredType)
    })

    it('getMoveCardBoardToBoardActions() should return expected action', async () => {
      const result = await trello.getMoveCardToBoardActions(actions)
      result.length.should.equal(1)
      result[0].type.should.equal(moveCardToBoardType)
    })
  })

}