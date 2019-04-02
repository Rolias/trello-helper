// @ts-check
const chai = require('chai')
chai.should()
const moment = require('moment')
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
const resolveEmptyObj = {}

// const resolveArrayAsString = JSON.stringify([{id: '123', idList: `${FAKE_ID}`}, {id: '456', idList: '789'}])
const resolveArrayAsJson = [{id: '123', idList: `${FAKE_ID}`}, {id: '456', idList: '789'}]
let getStub
const getStubParamObj = () => getStub.getCall(0).args[0]

let putStub
const putStubParamObj = () => putStub.getCall(0).args[0]

let postStub
const postStubParamObj = () => postStub.getCall(0).args[0]

let deleteStub
const deleteStubParamObj = () => deleteStub.getCall(0).args[0]

describe('trello class UNIT TESTS', () => {

  it('constructor should throw with no parameter and no local .env.json file', () => {
    sandbox.stub(logger, 'error')
      // @ts-ignore
      ; (() => {new Trello()}).should.throw()
    sandbox.restore()
  })

  describe('using reject ', () => {
    beforeEach(() => {
      // @ts-ignore
      sandbox.stub(TrelloRequest.prototype, 'get').returns(Promise.reject(rejectMsg))
    })
    afterEach(() => {
      sandbox.restore()
    })

    it('get() should reject', async () => {
      // @ts-ignore
      try {
        await trello.get({path: fakeCmd, options: {}})
        true.should.be.false('expected exception was not thrown')
      } catch (error) {
        error.should.equal(rejectMsg)
      }
    })

    it('getCardsOnList() should reject', async () => {
      // @ts-ignore
      await trello.getCardsOnList({listId: fakeCmd, options: {}})
        .catch((error) => {
          error.should.equal(rejectMsg)
        })
    })
  })


  describe('trello functions that return card object resolve', () => {
    beforeEach(() => {
      postStub = sandbox.stub(TrelloRequest.prototype, 'post')
        // @ts-ignore
        .returns(Promise.resolve(resolveObj))
      putStub = sandbox.stub(TrelloRequest.prototype, 'put')
        // @ts-ignore  
        .returns(Promise.resolve(resolveEmptyObj))
      deleteStub = sandbox.stub(TrelloRequest.prototype, 'delete')
        // @ts-ignore
        .returns(Promise.resolve(resolveObj))
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('addCard() should', () => {
      let paramObj
      beforeEach(async () => {
        await trello.addCard({name: 'Test', desc: 'Something', idList: FAKE_ID})
        paramObj = postStubParamObj()
      })
      it('create expected path parameter', () => {
        paramObj.path.should.equal('/1/cards')
      })

      it('have an  options argument with three properties', () => {
        Object.keys(paramObj.body).length.should.equal(3)
      })
    })

    describe('deleteCard()', () => {
      it('should get the proper path for deleting a card', async () => {
        await trello.deleteCard({cardId: FAKE_ID})
        const expected = Trello.getCardPrefixWithId(FAKE_ID)
        deleteStubParamObj().path.should.equal(expected)
      })
    })

    describe('setCustomFieldValueOnCard()', () => {
      const fieldType = Trello.customFieldType
      let customFieldObj = {
        cardFieldObj: {
          cardId: FAKE_ID,
          fieldId: FAKE_ID,
        },
        type: fieldType.text,
        value: 'A value for custom text field',
      }
      const resetObj = {...customFieldObj}

      beforeEach(() => {
        customFieldObj = {...resetObj}
      })

      describe('when setting a text type', () => {
        let retObj
        let paramObj
        beforeEach(async () => {
          retObj = await trello.setCustomFieldValueOnCard(customFieldObj)
          paramObj = putStubParamObj()
        })
        it(' should have a proper path', () => {
          const expectedPath = `${Trello.getCustomFieldUpdateCmd(customFieldObj.cardFieldObj)}`
          paramObj.path.should.equal(expectedPath)
        })
        it('should have a body with the expect text value', () => {
          const expectedBody = {value: {text: 'A value for custom text field'}}
          paramObj.body.should.deep.equal(expectedBody)
        })
        it('should return an empty object', () => {
          retObj.should.equal(resolveEmptyObj)
        })
      })

      it(' should set an idValue for a list type field', async () => {
        customFieldObj.type = Trello.customFieldType.list
        customFieldObj.value = FAKE_ID
        await trello.setCustomFieldValueOnCard(customFieldObj)
        putStubParamObj().body.idValue.should.equal(FAKE_ID)
      })

    })

  })

  describe('trello functions that resolve and return array', () => {

    beforeEach(() => {

      getStub = sandbox.stub(TrelloRequest.prototype, 'get')
        // @ts-ignore
        .returns(Promise.resolve(resolveArrayAsJson))
      putStub = sandbox.stub(TrelloRequest.prototype, 'put')
        // @ts-ignore
        .returns(Promise.resolve(resolveArrayAsJson))
      postStub = sandbox.stub(TrelloRequest.prototype, 'post')
        // @ts-ignore
        .returns(Promise.resolve(resolveArrayAsJson))
      deleteStub = sandbox.stub(TrelloRequest.prototype, 'delete')
        // @ts-ignore
        .returns(Promise.resolve(resolveArrayAsJson))
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('getCardsOnList() with id and option properties', () => {
      beforeEach(async () => {
        await trello.getCardsOnList({listId: FAKE_ID, options: {limit: 10}})
      })
      it('should get a proper path ', async () => {
        getStubParamObj().path.should.equal(Trello.getListCardCmd(FAKE_ID))
      })
      it('should have an option parameter equal to 10', async () => {
        getStubParamObj().options.limit.should.equal(10)
      })
    })
    describe('getCardsOnList() with id and empty option properties', () => {
      beforeEach(async () => {
        await trello.getCardsOnList({listId: FAKE_ID, options: {}})
      })
      it('should get a proper path ', async () => {
        getStubParamObj().path.should.equal(Trello.getListCardCmd(FAKE_ID))
      })
      it('should have an option parameter equal to {}', async () => {
        getStubParamObj().options.should.deep.equal({})
      })
    })


    describe('getCardsOnBoard() with id and option properties', () => {
      beforeEach(async () => {
        await trello.getCardsOnBoard({boardId: FAKE_ID, options: {limit: 10}})
      })
      it('should get a proper path ', async () => {
        getStubParamObj().path.should.equal(`/1/board/${FAKE_ID}/cards`)
      })
      it('should have an option parameter equal to 10', async () => {
        getStubParamObj().options.limit.should.equal(10)
      })
    })

    describe('getAllActionsOnCard() with blank filter should', () => {
      beforeEach(async () => {
        await trello.getActionsOnCard({cardId: FAKE_ID, filter: ''})
      })

      it('have the expected path', async () => {
        getStubParamObj().path.should.equal('/1/cards/12345/actions')
      })
      it('have an object of {filter:"all"}', async () => {
        getStubParamObj().options.filter.should.equal('all')
      })
    })

    describe('archiveAllCardsOnList()', () => {
      beforeEach(async () => {
        await trello.archiveAllCardsOnList({listId: FAKE_ID})
      })
      it('should have the expected path', () => {
        const expected = `${Trello.getListPrefixWithId(FAKE_ID)}/archiveAllCards`
        postStubParamObj().path.should.equal(expected)
      })
      it('should have an empty body property', () => {
        postStubParamObj().body.should.deep.equal({})
      })

    })
    describe('getArchivedCards() should', () => {
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
        const cardParams = {cardId: FAKE_ID, text: FAKE_COMMENT}
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
        cardId: FAKE_ID,
        offset: {count: 7, units: 'days'},
      })
      const putParam = putStubParamObj()
      putParam.path.should.equal('/1/cards/12345/due')
      moment(putParam.body.value).isSame(moment().add(7, 'days'), 'day')

    })

    describe('setDueComplete() should', () => {
      let putParam
      beforeEach(async () => {
        await trello.setDueComplete({cardId: FAKE_ID, isComplete: true})
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

      it('have the expected path', async () => {
        deleteStubParamObj().path.should.equal(`/1/cards/12345/idMembers/${FAKE_MEMBER_ID}`)
      })
    })


    it('getCustomFieldsOnCard should return the expected path', async () => {
      await trello.getCustomFieldItemsOnCard({cardId: FAKE_ID})
      const expected = `${Trello.getCardPrefixWithId(FAKE_ID)}/customFieldItems`
      getStubParamObj().path.should.equal(expected)
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
  it('enableFullResponse() should change request to full', () => {
    trello.enableFullResponse(true)
    trello.isInFullResponseMode().should.be.true
  })

  it('getRateLimitError() should return 429', () => {
    trello.getRateLimitError().should.equal(429)
  })

  it('getRateLimitDelayMs() should be 200', () => {
    trello.getRateLimitDelayMs().should.equal(200)
  })
})
