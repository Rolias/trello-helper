// @ts-check
const chai = require('chai')
chai.should()
const trello = require('./trello')
require('env-create').load({
  path: '/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json',
  debug: 'true',
})

// const GREENLIGHT_LIST_ID = '55c3cdfb267cd03b23d104c6'
const ABOUT_LIST_ID = '546e5dde53994b64db614cd1'

describe.only('trello module', () => {
  before(() => {
    trello.init()
  })

  it('getListCardsFrom() should return at least three cards when using the ABOUT list', async () => {
    const result = await trello.getListCards(ABOUT_LIST_ID)
      .catch(err => {
        console.log('INT TEST THROW:', err)
      })
    // @ts-ignore
    result.length.should.be.gt(3)
  })
})

