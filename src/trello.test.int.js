/* eslint-disable prefer-arrow-callback */
// @ts-check
const chai = require('chai')
const should = chai.should()
const Trello = require('./Trello')
const logger = require('./util/logger')
// @ts-ignore
const testData = require('./test-data/integration.json')
const BOARD_ID = testData.ids.board // https://trello.com/b/5c9a9d82c644b836cfbe9a85
const LIST_ID = testData.ids.list
const ARCHIVE_LIST_ID = testData.ids.archiveList
const CUSTOM_FIELD_TEXT = testData.ids.customFieldText
const CUSTOM_FIELD_LIST = testData.ids.customFieldList
const CUSTOM_FIELD_LIST_VALUE = testData.ids.customFieldListValue

const CARD_ID = testData.ids.card
const MEMBER_ID = testData.ids.member
const trello = new Trello('/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json')


describe('trello module INTEGRATION', function () {

  this.timeout(20000)
  before(() => {
    logger.level = 'info'
  })
  after(() => {
    logger.level = 'debug'
  })

  it('getActionsOnCard() should return ten actions', async () => {
    const result = await trello.getActionsOnCard({cardId: CARD_ID, options: {limit: 10}})
    result.length.should.equal(10)
  })

  it('getMoveCardToBoardActions() should find any action indicating card was moved to board', async () => {
    const actions = await trello.getActionsOnCard({cardId: CARD_ID, options: {filter: 'moveCardToBoard'}})
    const result = await Trello.getMoveCardToBoardActions(actions)
    result.length.should.be.gt(0)
  })


  describe('getCardsOnList() should', () => {

    it('process withOptions{} object', async () => {
      const result = await trello.getCardsOnList({
        listId: '5c4b6f254a94846d2f0c65df',
        options: {
          fields: 'name,id',
          limit: 1,
        },
      })
      result.length.should.equal(1)
      Object.keys(result[0]).length.should.equal(2)
    })

    it('can get back customFieldItems', async () => {

      const result = await trello.getCardsOnList({
        listId: LIST_ID,
        options: {
          fields: 'name',
          customFieldItems: true,
        },
      })
      should.exist(result[0].customFieldItems)
    })

    it('work with empty options', async () => {
      // will also work if withOptions is missing - but ts lint checker won't be happy
      const result = await trello.getCardsOnList({
        listId: LIST_ID,
        options: {getCustomFields: true},
      })
      result.length.should.be.gt(0)
      Object.keys(result[0]).length.should.be.gt(2)
    })
  })

  // NOTE: getArchivedCards() has been deprecated
  // describe('getArchivedCards()', () => { // FRAGILE - test list must have one  archived card
  //   let archiveResult
  //   beforeEach(async () => {
  //     archiveResult = await trello.getArchivedCards({
  //       boardId: BOARD_ID, listId: LIST_ID,
  //     })
  //   })
  //   it('should return at least one archived card (make sure one exists)', () => {
  //     archiveResult.length.should.be.gt(0)
  //   })
  //   it('should show that every returned card is closed', () => {
  //     archiveResult.every(e => e.closed).should.be.true
  //   })
  // })

  describe('getArchivedCardsOnBoard()', () => {
    let archiveResult
    beforeEach(async () => {
      // FRAGILE - board must have one archived card
      archiveResult = await trello.getArchivedCardsOnBoard({
        boardId: BOARD_ID,
        options: {},
      })
    })
    it('should return at least one archived card (make sure on exists)', () => {
      archiveResult.length.should.be.gt(0)
    })
    it('should show that every returned card is closed', () => {
      archiveResult.every(e => e.closed).should.be.true
    })
  })

  it('setDueComplete works', async () => {
    const testCardId = '5c8891992a649d6fc0d6c598'
    let result = await trello.setDueComplete({cardId: testCardId, isComplete: false})
    result.dueComplete.should.be.false
    result = await trello.setDueComplete({cardId: testCardId, isComplete: true})
    result.dueComplete.should.be.true
  })

  describe('Card Creation/Deletion  ', () => {
    const param = {
      name: 'Remotely Added Card',
      desc: 'test',
      idList: LIST_ID,
    }

    describe('addCard()', () => {
      let result
      before(async () => {
        result = await trello.addCard(param)
      })
      after(async () => {
        await trello.deleteCard({cardId: result.id})
      })
      it('should add a card with id specified', async () => {
        should.exist(result.id)
      })
      it('should add a card with name specified', async () => {
        result.name.should.equal('Remotely Added Card')
      })
      it('should add a card with description specified', async () => {
        result.desc.should.equal('test')
      })
    })
    it(' Delete any cards created in the last week', async () => {
      const moment = require('moment')
      const recent = moment().subtract(14, 'days')
        .toISOString()
      const result = await trello.getCardsOnList({listId: ARCHIVE_LIST_ID, options: {since: recent}})
      console.log('number found = ', result.length)
      for (const card of result) {
        await trello.deleteCard({cardId: card.id})
      }
    })

  })

  describe('Archiving/Unarchiving', () => {
    let numCardsOnArchiveList

    after(async () => {
      await trello.unarchiveAllCardsOnList({listId: ARCHIVE_LIST_ID})
    })

    it('unarchiveAllCardsOnList() should do that', async () => {
      await trello.unarchiveAllCardsOnList({listId: ARCHIVE_LIST_ID})
      const afterUnarchive = await trello.getCardsOnList({listId: ARCHIVE_LIST_ID, options: {}})
      numCardsOnArchiveList = afterUnarchive.length
      numCardsOnArchiveList.should.be.gt(0)
    })

    it('archiveAllCardsOnList() should produce an empty list', async () => {
      await trello.unarchiveAllCardsOnList({listId: ARCHIVE_LIST_ID})
      const result = await trello.getCardsOnList({listId: ARCHIVE_LIST_ID, options: {}})
      result.length.should.be.gt(0)
      await trello.archiveAllCardsOnList({listId: ARCHIVE_LIST_ID})
      const afterArchive = await trello.getCardsOnList({listId: ARCHIVE_LIST_ID, options: {}})
      afterArchive.length.should.equal(0)
    })

  })


  describe('Member Functions', () => {
    it('addMemberToCard() should add the member', async () => {
      const result = await trello.addMemberToCard({cardId: CARD_ID, memberId: MEMBER_ID})
      result[0].id.should.equal(MEMBER_ID)
    })

    it('removeMemberFromCard() should remove the member', async () => {
      const result = await trello.removeMemberFromCard({cardId: CARD_ID, memberId: MEMBER_ID})
      result.length.should.equal(0)
    })
  })


  // FRAGILE When the previous member add and remove the array for the board may
  // not have updated. So the resulting array can have 0 or 1 based on timing
  // mostly we want to make sure we don't get any errors
  it('getMembersOnBoard() should return a list of members', async () => {
    const result = await trello.getMembersOnBoard({boardId: BOARD_ID})
    result.length.should.be.lt(2)
  })

  describe('getCardsOnBoard()', () => {
    it('should work with no options', async () => {
      const result = await trello.getCardsOnBoard({boardId: BOARD_ID, options: {}})
      result.length.should.be.gt(0)
    })

    it('should only return the requested fields and id', async () => {
      const result = await trello.getCardsOnBoard({boardId: BOARD_ID, options: {fields: 'name,desc'}})
      result.length.should.be.gt(0)
      const keys = Object.keys(result[0])
      keys.length.should.equal(3)
    })
  })

  it('getCustomFieldItemsOnCard() should get the custom items', async () => {
    const result = await trello.getCustomFieldItemsOnCard({cardId: CARD_ID})
    logger.debug(`Custom Field Items on Card ${JSON.stringify(result, null, 2)}`)
  })

  it('setCustomFieldValueOnCard() should set a custom text field', async () => {
    const fieldId = CUSTOM_FIELD_TEXT
    const cardId = CARD_ID
    const type = Trello.customFieldType.text
    const value = 'Tod Gentille'
    await trello.setCustomFieldValueOnCard({cardFieldObj: {cardId, fieldId}, type, value})
  })

  it('setCustomFieldValueOnCard() should set a custom list field', async () => {
    const fieldId = CUSTOM_FIELD_LIST
    const cardId = CARD_ID
    const type = Trello.customFieldType.list
    const value = CUSTOM_FIELD_LIST_VALUE // low priority
    await trello.setCustomFieldValueOnCard({cardFieldObj: {cardId, fieldId}, type, value})

  })

  it('setClosedState ...', async () => {
    let result = await trello.setClosedState({cardId: '5ca01ee36f576f22802d4afe', isClosed: true})
    result.closed.should.be.true
    result = await trello.setClosedState({cardId: '5ca01ee36f576f22802d4afe', isClosed: false})
    result.closed.should.be.false
  })
})
