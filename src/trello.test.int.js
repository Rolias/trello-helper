/* eslint-disable prefer-arrow-callback */
// @ts-check
const chai = require('chai')
const should = chai.should()
const Trello = require('./trello')
const logger = require('./util/logger')
// @ts-ignore
const testData = require('./test-data/integration.json')
const BOARD_ID = testData.ids.board
const LIST_ID = testData.ids.list
const CARD_ID = testData.ids.card
const trello = new Trello('/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json')

before(() => {
  logger.level = 'info'
})
after(() => {
  logger.level = 'debug'
})

describe('trello module', function () {
  this.timeout(10000)
  before(() => {

    // trello = new Trello('/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json')
  })

  it('getAllActionsOnCard() should return some actions', async () => {
    const result = await trello.getAllActionsOnCard(CARD_ID)
    result.length.should.be.gt(0)
  })

  it('should be able to call base class method getCardsForList()', async () => {
    const result = await trello.getCardsForList(LIST_ID)
    result.length.should.be.gt(0)
    logger.debug(result.length)
  })


  describe('getCardsOnList() should', () => {

    it('process withOptions{} object', async () => {
      const result = await trello.getCardsOnList({
        id: LIST_ID,
        options: {
          fields: 'name,id',
          limit: 1,
        },
      })
      result.length.should.equal(1)
      Object.keys(result[0]).length.should.equal(2)
    })

    it('work with empty options', async () => {
      // will also work if withOptions is missing - but ts lint checker won't be happy
      const result = await trello.getCardsOnList({
        id: LIST_ID,
        options: {},
      })
      result.length.should.be.gt(1)
      Object.keys(result[0]).length.should.be.gt(2)
    })
  })


  it('getArchivedCards() should return only archived cards from list', async () => {
    const result = await trello.getArchivedCards({
      boardId: BOARD_ID, listId: LIST_ID,
    })
    logger.debug(result[0])
    result.every(e => e.closed).should.be.true
  })

  it('getMoveToBoardInfo() should find any action indicating card was move to board', async () => {
    const actions = await trello.getAllActionsOnCard(CARD_ID)
    const result = await trello.getMoveCardToBoardActions(actions)
    result.length.should.equal(1)
  })

  it('setDueComplete works', async () => {
    const testCardId = '5c8891992a649d6fc0d6c598'
    let result = await trello.setDueComplete({id: testCardId, isComplete: false})
    result.dueComplete.should.be.false
    result = await trello.setDueComplete({id: testCardId, isComplete: true})
    result.dueComplete.should.be.true
  })

  it('addCard() should add a card', async () => {
    const param = {
      name: 'Remotely Added Card', description: 'test',
      idList: LIST_ID,
    }
    const result = await trello.addCard(param)
    should.exist(result.id)
    await trello.deleteCard(result.id)
  })

})

