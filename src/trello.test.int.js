// @ts-check
const chai = require('chai')
chai.should()
const trelloOld = require('./trello_old')
const Trello = require('./trello')

const moment = require('moment')
require('env-create').load({
  path: '/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json',
  debug: 'true',
})

// const GREENLIGHT_LIST_ID = '55c3cdfb267cd03b23d104c6'
const ABOUT_LIST_ID = '546e5dde53994b64db614cd1'
const TOD_TEST_CARD_ID = '5c86f7cd9a1aae62ca63fb54'

describe.only('trello module', () => {
  before(() => {
    trelloOld.init()
  })

  it('getListCardsFrom() should return at least three cards when using the ABOUT list', async () => {
    const result = await trelloOld.getListCards(ABOUT_LIST_ID)
      .catch(err => {
        console.log('INT TEST THROW:', err)
      })
    // @ts-ignore
    result.length.should.be.gt(3)
  })
  it('setDueDate() should set a date two days from now', async () => {
    const result = await trelloOld.setDueDate({
      card: {id: TOD_TEST_CARD_ID},
      delay: {count: 2, unit: 'days'},
    })
    moment(result.due).isAfter()
  })

  it.only('getCardActions() should return some actions', async () => {
    const trello = new Trello('/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json')

    const result = await trello.getAllActionsOnCard(TOD_TEST_CARD_ID)
      .catch(err => {
        console.log('OOOPSSIE', err)
      })
    console.log(result.length)
  })
})

