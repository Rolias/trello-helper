/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as chai from 'chai'
chai.should()
import * as sinon from 'sinon'
const sandbox = sinon.createSandbox()
import {TrelloBase} from './TrelloBase'
import {TrelloGet} from './TrelloGet'
import {TrelloRequest} from './TrelloRequest'
import {pathToCreds} from './test-data/testDataConst'
import {DictObj} from './Interfaces'
const FAKE_ID = '12345'

const {match} = sinon
const trelloGet = new TrelloGet(pathToCreds)

const resolveArrayAsJson = [{id: '123', idList: `${FAKE_ID}`}, {id: '456', idList: '789'}]
// let getStub
describe('TrelloGet Unit Tests', () => {
  let getStub: sinon.SinonStub
  before(() => {
    getStub = sandbox.stub(TrelloRequest.prototype, 'get')
      // @ts-ignore
      .returns(Promise.resolve(resolveArrayAsJson))
  })
  after(() => {
    sandbox.restore()
  })
  describe('getCard() should', () => {
    beforeEach(async () => {
      await trelloGet.getCard({cardId: FAKE_ID, options: {fields: 'name'}})
    })
    it('should have expected path parameter', () => {
      const expected = TrelloBase.getBoardPrefixWithId(FAKE_ID)
      getStub.calledWith(match({path: expected})).should.be.true
    })
    it('should have an options:fields property set to name', () => {
      getStub.calledWith(match.hasNested('options.fields', 'name')).should.be.true
    })
  })

  describe('getActionsOnCard() with blank filter should', () => {
    beforeEach(async () => {
      await trelloGet.getActionsOnCard({cardId: FAKE_ID, })
    })

    it('have the expected path', async () => {
      getStub.calledWith(match({path: '/1/cards/12345/actions'})).should.be.true
    })
    it('have an object property filter="all"}', async () => {
      getStub.calledWith(match.hasNested('options.filter', 'all')).should.be.true
    })
    it('have an object property limit="1000" (the max)}', async () => {
      getStub.calledWith(match.hasNested('options.limit', 1000)).should.be.true
    })
  })


  describe('getCardsOnBoard() with id and option properties', () => {
    beforeEach(async () => {
      await trelloGet.getCardsOnBoard({boardId: FAKE_ID, options: {limit: 10}})
    })
    it('should get a proper path ', async () => {
      const expected = `/1/board/${FAKE_ID}/cards`
      getStub.calledWith(match({path: expected})).should.be.true
    })
    it('should have an option parameter equal to 10', async () => {
      getStub.calledWith(match.hasNested('options.limit', 10)).should.be.true
    })
  })

  describe('getCardsOnList() with id and option properties', () => {
    beforeEach(async () => {
      await trelloGet.getCardsOnList({listId: FAKE_ID, options: {limit: 10}})
    })
    it('should get a proper path ', async () => {
      const expectedPath = TrelloBase.getListCardCmd(FAKE_ID)
      getStub.calledWith(match({path: expectedPath})).should.be.true
    })
    it('should have an option parameter equal to 10', async () => {
      getStub.calledWith(match.hasNested('options.limit', 10)).should.be.true
    })
  })

  describe('getCardsOnList() with id and empty option properties', () => {
    beforeEach(async () => {
      await trelloGet.getCardsOnList({listId: FAKE_ID})
    })
    it('should get a proper path ', async () => {
      const expected = TrelloBase.getListCardCmd(FAKE_ID)
      getStub.calledWith(match({path: expected})).should.be.true
    })
    it('should have an option parameter equal to {}', async () => {
      getStub.calledWith(match({options: {}})).should.be.true
    })
  })

  describe('getArchivedCardsOnBoard() should', () => {
    let result: DictObj[]
    beforeEach(async () => {
      result = await trelloGet.getArchivedCardsOnBoard({boardId: FAKE_ID})
    })
    it('have the expected path', () => {
      getStub.calledWith(sinon.match({path: '/1/board/12345/cards'})).should.be.true
    })
    it('have an object of {filter:"closed"}', () => {
      getStub.calledWith(sinon.match.hasNested('options.filter', 'closed')).should.be.true
    })
    it('should return all cards in fake get', () => {
      result.length.should.equal(resolveArrayAsJson.length)
    })
  })

  describe('getArchivedCardsOnList() should', () => {
    let result: DictObj[]
    beforeEach(async () => {
      result = await trelloGet.getArchivedCardsOnList({listId: FAKE_ID})
    })
    it('have the expected path', () => {
      getStub.calledWith(sinon.match({path: '/1/lists/12345/cards'})).should.be.true
    })
    it('have an object of {filter:"closed"}', () => {
      getStub.calledWith(sinon.match.hasNested('options.filter', 'closed')).should.be.true
    })
    it('should return all cards in fake get', () => {
      result.length.should.equal(resolveArrayAsJson.length)
    })
  })

  it('getCustomFieldsOnCard should get the expected path', async () => {
    await trelloGet.getCustomFieldItemsOnCard({cardId: FAKE_ID})
    const expected = `${TrelloBase.getCardPrefixWithId(FAKE_ID)}/customFieldItems`
    getStub.calledWith(match({path: expected})).should.be.true
  })

  it('getMembersOnBoard() should get the expected path and empty options', async () => {
    await trelloGet.getMembersOnBoard({boardId: FAKE_ID})
    const expected = `${TrelloBase.getBoardPrefixWithId(FAKE_ID)}/members`
    getStub.calledWith(match({path: expected})).should.be.true
  })

  it('getBoardIdFromListId() ', async () => {
    await trelloGet.getBoardIdFromListId({listId: FAKE_ID})
    const expected = `${TrelloBase.getListPrefixWithId(FAKE_ID)}/board`
    getStub.calledWith(match({path: expected})).should.be.true
    getStub.calledWith(match.has('options', {fields: 'id'})).should.be.true
  })
})