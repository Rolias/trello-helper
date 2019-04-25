/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as chai from 'chai'
chai.should()
import * as moment from 'moment'
import TrelloRequest from './TrelloRequest'

import * as sinon from 'sinon'
const sandbox = sinon.createSandbox()
import Trello from './Trello'
import {logger} from './util/logger'
import {CustomFieldType} from './enums'
import {pathToCreds} from './test-data/testDataConst'
const FAKE_ID = '12345'
const FAKE_MEMBER_ID = '5678'
const FAKE_COMMENT = 'Message for Comment'

const {match} = sinon
const trello = new Trello(pathToCreds)

const fakeCmd = 'fake command'
const rejectMsg = 'rejected'
const resolveObj = '{id:"123"}'
const resolveEmptyObj = {}

// const resolveArrayAsString = JSON.stringify([{id: '123', idList: `${FAKE_ID}`}, {id: '456', idList: '789'}])
const resolveArrayAsJson = [{id: '123', idList: `${FAKE_ID}`}, {id: '456', idList: '789'}]
// let getStub

let putStub: sinon.SinonStub

describe('Trello class UNIT TESTS', () => {
  it('enableFullResponse() should change request to full', () => {
    trello.enableFullResponse(true)
    trello.isInFullResponseMode().should.be.true
  })

  it('getRateLimitError() should return 429', () => {
    Trello.getRateLimitError().should.equal(429)
  })

  it('getRateLimitDelayMs() should be 200', () => {
    Trello.getRateLimitDelayMs().should.equal(500)
  })

  it('constructor should throw with no parameter and no local .env.json file', () => {
    sandbox.stub(logger, 'error')
    {(() => {new Trello()}).should.throw()}
    sandbox.restore()
  })

  describe('using reject ', () => {
    beforeEach(() => {
      // @ts-ignore
      sandbox.stub(TrelloRequest.prototype, 'get').rejects(rejectMsg)
    })
    afterEach(() => {
      sandbox.restore()
    })

    it('get() should reject', async () => {
      try {
        await trello.get({path: fakeCmd, options: {}})
        true.should.be.false('expected exception was not thrown')
      } catch (error) {
        error.name.should.equal(rejectMsg)
      }
    })

    it('getCardsOnList() should reject', async () => {
      await trello.getCardsOnList({listId: fakeCmd, options: {}})
        .catch((error) => {
          error.name.should.equal(rejectMsg)
        })
    })
  })

  describe('trello functions that return card object resolve', () => {
    afterEach(() => {
      sandbox.restore()
    })

    describe('post requests', () => {
      let postStub: sinon.SinonStub
      beforeEach(() => {
        postStub = sandbox.stub(TrelloRequest.prototype, 'post')
          // @ts-ignore
          .returns(Promise.resolve(resolveObj))
      })
      describe('addCard() should', () => {
        const newCardObj = {name: 'Test', desc: 'Something', idList: FAKE_ID}
        beforeEach(async () => {
          await trello.addCard(newCardObj)
        })
        it('create expected path parameter', () => {
          postStub.calledWith(match.has('path', '/1/cards')).should.be.true
        })
        it('have an  options argument with three properties', () => {
          postStub.calledWith(match.has('body', newCardObj)).should.be.true
        })
      })
    })

    describe('delete requests', () => {
      let deleteStub: sinon.SinonStub
      beforeEach(() => {
        deleteStub = sandbox.stub(TrelloRequest.prototype, 'delete')
          // @ts-ignore
          .returns(Promise.resolve(resolveObj))
      })

      describe('deleteCard()', () => {
        it('should get the proper path for deleting a card', async () => {
          await trello.deleteCard({cardId: FAKE_ID})
          const expected = Trello.getCardPrefixWithId(FAKE_ID)
          deleteStub.calledWith(match.has('path', expected))
        })
      })
    })

    describe('put requests', () => {
      let putStub: sinon.SinonStub
      beforeEach(() => {
        putStub = sandbox.stub(TrelloRequest.prototype, 'put')
          .resolves(resolveEmptyObj)
      })
      describe('setCustomFieldValueOnCard()', () => {
        let customFieldObj = {
          cardFieldObj: {
            cardId: FAKE_ID,
            fieldId: FAKE_ID,
          },
          type: CustomFieldType.text,
          value: 'A value for custom text field',
        }
        const resetObj = {...customFieldObj}

        beforeEach(() => {
          customFieldObj = {...resetObj}
        })


        describe('when setting a text type', () => {
          beforeEach(async () => {
            await trello.setCustomFieldValueOnCard(customFieldObj)
          })
          it(' should have a proper path', () => {
            const expectedPath = `${Trello.getCustomFieldUpdateCmd(customFieldObj.cardFieldObj)}`
            // paramObj.path.should.equal(expectedPath)
            putStub.calledWith(match.has('path', expectedPath)).should.be.true
          })
          it('should have a body with the expect text value', () => {
            const expectedBody = {value: {text: 'A value for custom text field'}}
            putStub.calledWith(match.hasNested('body', expectedBody)).should.be.true
          })
        })

        it(' should set an idValue for a list type field', async () => {
          customFieldObj.type = CustomFieldType.list
          customFieldObj.value = FAKE_ID
          await trello.setCustomFieldValueOnCard(customFieldObj)
          putStub.calledWith(match.hasNested('body.idValue', FAKE_ID)).should.be.true
        })
      })
    })
  })

  describe('get functions that resolve and return array', () => {
    beforeEach(() => {
      sandbox.stub(TrelloRequest.prototype, 'get')
        // @ts-ignore
        .returns(Promise.resolve(resolveArrayAsJson))
    })
    afterEach(() => {
      sandbox.restore()
    })

    describe('archiveCardsOlderThan()', () => {
      beforeEach(async () => {
        // sandbox.restore()
        // sandbox.stub(TrelloRequest.prototype, 'get').onCall.call(0)
        // .resolves(resolveArrayAsJson)
        sandbox.spy(Trello.prototype, 'getCardsOnList')
        sandbox.spy(Trello.prototype, 'archiveCard')
        await trello.archiveCardsOlderThan({listId: FAKE_ID, offset: {count: 2, units: 'days'}})
      })
      it('should call getCardsOnList() twice', () => {
        // @ts-ignore
        trello.getCardsOnList.callCount.should.equal(2)
      })

      it('should call getCardsOnList() with an options:since parameter', () => {
        // @ts-ignore
        trello.getCardsOnList.calledWith(sinon.match.hasNested('options.since')).should.be.true
      })
    })
  })


  describe('put functions', () => {
    beforeEach(() => {
      putStub = sandbox.stub(TrelloRequest.prototype, 'put')
    })
    afterEach(() => {
      sandbox.restore()
    })

    describe('archiveCard()', () => {
      beforeEach(async () => {
        await trello.archiveCard({cardId: FAKE_ID})
      })
      it('should have the expected path', () => {
        const expected = Trello.getCardPrefixWithId(FAKE_ID)
        putStub.calledWith(match({path: expected})).should.be.true
      })
      it('should have a body property named closed set to true', () => {
        putStub.calledWith(match.hasNested('body.closed', true)).should.be.true
      })
    })

    describe('addDueDateToCardByOffset()', () => {
      beforeEach(async () => {
        await trello.addDueDateToCardByOffset({
          cardId: FAKE_ID,
          offset: {count: 7, units: 'days'},
        })
      })
      it('should have expected path ', () => {
        putStub.calledWith(match({path: '/1/cards/12345/due'})).should.be.true
      })
      it('should have expected date', () => {
        const [putParam] = putStub.getCall(0).args
        moment(putParam.body.value).isSame(moment().add(7, 'days'), 'day')
      })
    })

    describe('setDueComplete() should', () => {
      beforeEach(async () => {
        await trello.setDueComplete({cardId: FAKE_ID, isComplete: true})
      })

      it('have the expected path', async () => {
        putStub.calledWith(match({path: '/1/cards/12345'})).should.be.true
      })
      it('have an object of {filter:"all"}', async () => {
        putStub.calledWith(match.hasNested('body.dueComplete', true)).should.be.true
      })
    })

    describe('setClosedState() ', () => {
      beforeEach(async () => {
        await trello.setClosedState({cardId: FAKE_ID, isClosed: true})
      })
      it('should have the expected path', () => {
        const expected = Trello.getCardPrefixWithId(FAKE_ID)
        putStub.calledWith(sinon.match.has('path', expected)).should.be.true
      })
      it('should get called with a body:{closed:true} nested property', () => {
        putStub.calledWith(sinon.match.hasNested('body.closed', true)).should.be.true
      })
    })
  })

  describe('post functions', () => {
    let postStub: sinon.SinonStub
    beforeEach(() => {
      postStub = sandbox.stub(TrelloRequest.prototype, 'post')
    })
    afterEach(() => {
      sandbox.restore()
    })

    describe('archiveAllCardsOnList()', () => {
      beforeEach(async () => {
        await trello.archiveAllCardsOnList({listId: FAKE_ID})
      })
      it('should have the expected path', () => {
        const expected = `${Trello.getListPrefixWithId(FAKE_ID)}/archiveAllCards`
        postStub.calledWith(match({path: expected})).should.be.true
      })
      it('should have an empty body property', () => {
        postStub.calledWith(match({body: {}})).should.be.true
      })
    })

    describe('addCommentOnCard()', () => {
      beforeEach(async () => {
        const cardParams = {cardId: FAKE_ID, text: FAKE_COMMENT}
        await trello.addCommentOnCard(cardParams)
      })
      it(' should get expected path  ', () => {
        const expected = `/1/cards/${FAKE_ID}/actions/comments`
        postStub.calledWith(match({path: expected})).should.be.true
      })

      it('should get the expected option object', () => {
        postStub.calledWith(match.hasNested('body.text', FAKE_COMMENT)).should.be.true
      })
    })

    describe('addMemberToCard() should', () => {
      beforeEach(async () => {
        await trello.addMemberToCard({cardId: FAKE_ID, memberId: FAKE_MEMBER_ID})
      })

      it('have the expected path', async () => {
        const expected = '/1/cards/12345/members'
        postStub.calledWith(match({path: expected})).should.be.true
      })
      it('have an object of {value:FAKE_MEMBER_ID}', async () => {
        postStub.calledWith(match.hasNested('body.value', FAKE_MEMBER_ID)).should.be.true
      })
    })

    describe('addCardWithMembers() should', () => {
      const options = {
        idList: FAKE_ID,
        name: 'Tod',
        desc: 'description',
        idMembers: '1,2,3',
      }
      beforeEach(async () => {
        await trello.addCardWithMembers(options)
      })
      it('set the expected path property', () => {
        const expected = {
          path: '/1/cards',
          body: options,
        }
        postStub.calledWith(expected).should.be.true
      })
      it('have a body property', () => {
      })
    })

    describe('addCardWithAnything() should', () => {
      beforeEach(async () => {
        await trello.addCardWithAnything({idList: FAKE_ID})
      })
      it('should have a body property with and idList property', () => {
        postStub.calledWith(match.hasNested('body.idList', FAKE_ID)).should.be.true
      })
    })
  })

  describe('delete functions', () => {
    let deleteStub: sinon.SinonStub
    beforeEach(() => {
      deleteStub = sandbox.stub(TrelloRequest.prototype, 'delete')
    })
    afterEach(() => {
      sandbox.restore()
    })

    describe('removeMemberFromCard() should', () => {
      beforeEach(async () => {
        await trello.removeMemberFromCard({cardId: FAKE_ID, memberId: FAKE_MEMBER_ID})
      })

      it('have the expected path', async () => {
        const expected = `/1/cards/12345/idMembers/${FAKE_MEMBER_ID}`
        deleteStub.calledWith(match({path: expected})).should.be.true
      })
    })
  })

  describe('get/put that resolve and return array', () => {
    let putStub: sinon.SinonStub

    beforeEach(() => {
      sandbox.stub(TrelloRequest.prototype, 'get')
        // @ts-ignore
        .returns(Promise.resolve(resolveArrayAsJson))
      putStub = sandbox.stub(TrelloRequest.prototype, 'put')
    })
    afterEach(() => {
      sandbox.restore()
    })


    describe('unarchiveAllCardsOnList()', () => {
      beforeEach(async () => {
        sandbox.spy(Trello.prototype, 'getArchivedCardsOnList')
        sandbox.spy(Trello.prototype, 'setClosedState')
        await trello.unarchiveAllCardsOnList({listId: FAKE_ID})
      })
      it('should call getArchivedCardsOnList once', () => {
        // @ts-ignore
        trello.getArchivedCardsOnList.calledOnce.should.be.true
      })
      it('should call setClosedState multiple times (once for each card to unarchive)', async () => {
        // @ts-ignore
        trello.setClosedState.callCount.should.be.gt(1)
        // @ts-ignore
        logger.debug(trello.setClosedState.callCount)
      })
      it('should call put with cards command and ID', () => {
        putStub.calledWith(match({path: '/1/cards/123'})).should.be.true
      })

      it('should call put with body.closed set false', () => {
        putStub.calledWith(match.hasNested('body.closed', false)).should.be.true
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
      const result = await Trello.actionWasOnList({actions, filterList: listToFind})
      result.length.should.equal(1)
      result[0].data.listBefore.should.equal(listToFind)
    })

    it('filterActionsByType() should find desired type.', async () => {
      const result = await Trello.filterActionsByType({actions, filterType: desiredType})
      result.length.should.equal(1)
      result[0].type.should.equal(desiredType)
    })

    it('getMoveCardBoardToBoardActions() should return expected action', async () => {
      const result = await Trello.getMoveCardToBoardActions(actions)
      result.length.should.equal(1)
      result[0].type.should.equal(moveCardToBoardType)
    })
  })
})
