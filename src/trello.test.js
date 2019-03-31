// @ts-check
const chai = require('chai')
const should = chai.should()
const moment = require('moment')
const baseTrello = require('trello')
const TrelloRequest = require('./trelloRequest')


const sandbox = require('sinon').createSandbox()
const Trello = require('./trello')
const logger = require('./util/logger')
const FAKE_ID = '12345'
const FAKE_MEMBER_ID = '5678'
const FAKE_COMMENT = 'Message for Comment'


const trello = new Trello('./src/test-data/unit-test-fake-credentials.json')

const fakeCmd = 'fake command'
const rejectMsg = 'rejected'
const resolveObj = '{id:"123"}'
const resolveArrayAsString = JSON.stringify([{id: '123', idList: `${FAKE_ID}`}, {id: '456', idList: '789'}])
const resolveArrayAsJson = [{id: '123', idList: `${FAKE_ID}`}, {id: '456', idList: '789'}]
let getStub
const getStubParamObj = () => getStub.getCall(0).args[0]

let putStub
const putStubParamObj = () => putStub.getCall(0).args[0]

let postStub
const postStubParamObj = () => postStub.getCall(0).args[0]


let makeRequestStub
const makeRequestStubType = () => makeRequestStub.getCall(0).args[0]
const makeRequestStubPathParam = () => makeRequestStub.getCall(0).args[1]

describe('trello class', () => {})
{
  it('constructor should throw with no parameter and no local .env.json file', () => {
    sandbox.stub(logger, 'error')
      // @ts-ignore
      ; (() => {new Trello()}).should.throw()
    sandbox.restore()
  })

  describe('using reject ', () => {
    beforeEach(() => {
      sandbox.stub(TrelloRequest.prototype, 'get').returns(Promise.reject(rejectMsg))
    })
    afterEach(() => {
      sandbox.restore()
    })

    it('get() should reject', async () => {
      // @ts-ignore
      try {
        await trello.get(fakeCmd)
        true.should.be.false('expected exception was not thrown')
      } catch (error) {
        error.should.equal(rejectMsg)
      }
    })

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
      postStub = sandbox.stub(TrelloRequest.prototype, 'post')
        .returns(Promise.resolve(resolveObj))
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('addCard() should', () => {
      let paramObj
      beforeEach(async () => {
        await trello.addCard({name: 'Test', description: 'Something', idList: FAKE_ID})
        paramObj = postStubParamObj()
      })
      it('create expected path parameter', () => {
        paramObj.path.should.equal('/1/cards')
      })

      it('have an  options argument with three properties', () => {
        Object.keys(paramObj.body).length.should.equal(3)
      })
    })
  })

  describe('trello functions that resolve and return array', () => {


    beforeEach(() => {
      makeRequestStub = sandbox.stub(baseTrello.prototype, 'makeRequest')
        .returns(Promise.resolve(resolveArrayAsJson))
      getStub = sandbox.stub(TrelloRequest.prototype, 'get')
        .returns(Promise.resolve(resolveArrayAsString))
      putStub = sandbox.stub(TrelloRequest.prototype, 'put')
        .returns(Promise.resolve(resolveArrayAsJson))
      postStub = sandbox.stub(TrelloRequest.prototype, 'post')
        .returns(Promise.resolve(resolveArrayAsJson))

    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('getCardsOnList() with id only', () => {
      let paramObj
      beforeEach(async () => {
        await trello.getCardsOnList({id: FAKE_ID})
        paramObj = getStubParamObj()
      })
      it('should get a proper path ', async () => {
        const cmd = Trello.getListCardCmd(FAKE_ID)
        paramObj.path.should.equal(cmd)
      })
      it('should not have an option parameter', async () => {
        should.not.exist(paramObj.options)
      })

    })

    describe('getCardsOnList() with id and option properties', () => {
      beforeEach(async () => {
        await trello.getCardsOnList({id: FAKE_ID, options: {limit: 10}})
      })
      it('should get a proper path ', async () => {
        getStubParamObj().path.should.equal(Trello.getListCardCmd(FAKE_ID))
      })
      it('should have an option parameter equal to 10', async () => {
        getStubParamObj().options.limit.should.equal(10)
      })
    })

    describe('getCardsOnBoard() with id only', () => {
      beforeEach(async () => {
        await trello.getCardsOnBoard({id: FAKE_ID})
      })
      it('should get a proper path ', async () => {
        getStubParamObj().path.should.equal(`/1/board/${FAKE_ID}/cards`)
      })
      it('should not have an option parameter', async () => {
        should.not.exist(getStubParamObj().options)
      })
    })

    describe('getCardsOnBoard() with id and option properties', () => {
      beforeEach(async () => {
        await trello.getCardsOnBoard({id: FAKE_ID, options: {limit: 10}})
      })
      it('should get a proper path ', async () => {
        getStubParamObj().path.should.equal(`/1/board/${FAKE_ID}/cards`)
      })
      it('should have an option parameter equal to 10', async () => {
        getStubParamObj().options.limit.should.equal(10)
      })
    })

    describe('getAllActionsOnCard() should', () => {
      beforeEach(async () => {
        await trello.getAllActionsOnCard(FAKE_ID)
      })

      it('have the expected path', async () => {
        getStubParamObj().path.should.equal('/1/cards/12345/actions')
      })
      it('have an object of {filter:"all"}', async () => {
        getStubParamObj().options.filter.should.equal('all')
      })
    })

    describe('getArchivedCards(param) should', () => {
      let result
      beforeEach(async () => {
        result = await trello.getArchivedCards({boardId: FAKE_ID, listId: FAKE_ID})
      })

      it('have the expected path', () => {
        getStubParamObj().path.should.equal('/1/board/12345/cards')
      })
      it('have an object of {filter:"closed"}', () => {
        getStubParamObj().options.filter.should.equal('closed')
      })
      it('should return the action with the FAKE_ID idList ', () => {
        result.length.should.equal(1)
        result[0].idList.should.equal(FAKE_ID)
      })
    })

    describe('addCommentOnCard()', () => {
      let paramObj
      beforeEach(async () => {
        const cardParams = {id: FAKE_ID, text: FAKE_COMMENT}
        await trello.addCommentOnCard(cardParams)
        paramObj = postStubParamObj()
      })

      it(' should get expected path and option object ', () => {
        paramObj.path.should.equal(`/1/cards/${FAKE_ID}/actions/comments`)
      })

      it('should get the expected option object', () => {
        paramObj.body.text.should.equal(FAKE_COMMENT)
      })
    })


    it('addDueDateToCardByOffset constructs expected path and date', async () => {
      await trello.addDueDateToCardByOffset({
        id: FAKE_ID,
        offset: {count: 7, units: 'days'},
      })
      const putParam = putStubParamObj()
      putParam.path.should.equal('/1/cards/12345/due')
      moment(putParam.body.value).isSame(moment().add(7, 'days'), 'day')

    })

    describe('setDueComplete() should', () => {
      let putParam
      beforeEach(async () => {
        await trello.setDueComplete({id: FAKE_ID, isComplete: true})
        putParam = putStubParamObj()
      })

      it('have the expected path', async () => {
        putParam.path.should.equal('/1/cards/12345')
      })
      it('have an object of {filter:"all"}', async () => {
        putParam.body.dueComplete.should.be.true
      })
    })


    describe('addMemberToCard() should', () => {
      let paramObj
      beforeEach(async () => {
        await trello.addMemberToCard({cardId: FAKE_ID, memberId: FAKE_MEMBER_ID})
        paramObj = postStubParamObj()
      })

      it('have the expected path', async () => {
        paramObj.path.should.equal('/1/cards/12345/members')
      })
      it('have an object of {value:FAKE_MEMBER_ID}', async () => {
        paramObj.body.value.should.equal(FAKE_MEMBER_ID)
      })
    })

    describe('removeMemberFromCard() should', () => {
      beforeEach(async () => {
        await trello.removeMemberFromCard({cardId: FAKE_ID, memberId: FAKE_MEMBER_ID})
      })
      it('have done a delete()', async () => {
        makeRequestStubType().should.equal('delete')
      })
      it('have the expected path', async () => {
        makeRequestStubPathParam().should.equal(`/1/cards/12345/idMembers/${FAKE_MEMBER_ID}`)
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