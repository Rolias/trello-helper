/* eslint-disable prefer-arrow-callback */
// @ts-check
const chai = require('chai')
const should = chai.should()
const Trello = require('./trello')

const BOARD_ID = '54662dcf4218ed197f490560'
const ABOUT_LIST_ID = '546e5dde53994b64db614cd1'
const TOD_TEST_CARD_ID = '5b18626142a8d79aaafab7c6'
const trello = new Trello('/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json')

describe('trello module', function () {
  this.timeout(10000)
  before(() => {

    // trello = new Trello('/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json')
  })

  it('getAllActionsOnCard() should return some actions', async () => {
    const result = await trello.getAllActionsOnCard(TOD_TEST_CARD_ID)
      .catch(err => {
        console.log('OOOPSSIE', err)
      })
    result.length.should.be.gt(0)
  })

  it('should be able to call base class method getCardsForList()', async () => {
    const result = await trello.getCardsForList(ABOUT_LIST_ID)
    result.length.should.be.gt(0)
    console.log(result.length)
  })

  it('getCardsOnListWith() should process options', async () => {
    const result = await trello.getCardsOnListWith({
      id: ABOUT_LIST_ID, options: {
        fields: 'name,id',
        limit: 1,
      },
    })
    result.length.should.equal(1)
    Object.keys(result[0]).length.should.equal(2)
  })

  it('getArchivedCards() should return only archived cards from list', async () => {
    const result = await trello.getArchivedCards({
      forBoardId: BOARD_ID, onListId: ABOUT_LIST_ID,
    })
    console.log(result[0])
    result.every(e => e.closed).should.be.true
  })
  it('getMoveToBoardInfo() should find any action indicating card was move to board', async () => {
    const actions = await trello.getAllActionsOnCard(TOD_TEST_CARD_ID)
    const result = await trello.getMoveCardToBoardInfo(actions)
    result.status.should.equal(1)
  })

  it('setDueComplete works', async () => {
    const testCardId = '5c8891992a649d6fc0d6c598'
    let result = await trello.setDueComplete({id: testCardId, isComplete: false})
    result.dueComplete.should.be.false
    result = await trello.setDueComplete({id: testCardId, isComplete: true})
    result.dueComplete.should.be.true
  })

  it.only('addCard() should add a card', async () => {
    const param = {
      name: 'Remotely Added Card', description: 'test',
      idList: ABOUT_LIST_ID,
    }
    const result = await trello.addCard(param)
    should.exist(result.id)
    const res = await trello.deleteCard(result.id)
    console.log(res)
  })
})

