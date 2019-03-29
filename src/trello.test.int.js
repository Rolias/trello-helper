/* eslint-disable prefer-arrow-callback */
// @ts-check
const chai = require('chai')
const should = chai.should()
const Trello = require('./trello')
const logger = require('./util/logger')
// @ts-ignore
const testData = require('./test-data/integration.json')
const BOARD_ID = testData.ids.board // https://trello.com/b/5c9a9d82c644b836cfbe9a85
const LIST_ID = testData.ids.list
// const ARCHIVE_LIST_ID = testData.ids.archiveList
const CARD_ID = testData.ids.card
const MEMBER_ID = testData.ids.member
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

    it('can get back customFieldItems', async () => {

      const result = await trello.getCardsOnList({
        id: LIST_ID,
        options: {
          fields: 'name',
          customFieldItems: true,
        },
      })
      console.log(JSON.stringify(result, null, 2))
      should.exist(result[0].customFieldItems)
    })

    it('work with empty options', async () => {
      // will also work if withOptions is missing - but ts lint checker won't be happy
      const result = await trello.getCardsOnList({
        id: LIST_ID,
        options: {getCustomFields: true},
      })
      result.length.should.be.gt(0)
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

  it('getMoveToBoardInfo() should find any action indicating card was moved to board', async () => {
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

  describe('Card Creation  ', () => {
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
        await trello.deleteCard(result.id)
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

    // Causes a Cannot POST error so commented out here and the real func
    // TODO see if it can be fixed.
    // xit('archiveAllCardsOnlist() should produce an empty list', async () => {
    //   param.idList = ARCHIVE_LIST_ID
    //   await trello.addCard(param)
    //   const result = await trello.getCardsOnList({id: ARCHIVE_LIST_ID})
    //   result.length.should.be.gt(0)
    //   const archiveResult = await trello.archiveAllCardsOnList({id: ARCHIVE_LIST_ID})
    //   console.log(archiveResult)
    //   const afterArchive = await trello.getCardsOnList({id: ARCHIVE_LIST_ID})
    //   afterArchive.length.should.equal(0)
    // })


  })


  it('addMemberToCard() should add the member', async () => {
    const result = await trello.addMemberToCard({cardId: CARD_ID, memberId: MEMBER_ID})
    result[0].id.should.equal(MEMBER_ID)
  })

  it('removeMemberFromCard() should remove the member', async () => {
    const result = await trello.removeMemberFromCard({cardId: CARD_ID, memberId: MEMBER_ID})
    result.length.should.equal(0)
  })

  it('getMembersOnBoard() should return a list of members', async () => {
    const result = await trello.getMembersOnBoard({boardId: BOARD_ID})
    result.length.should.be.gt(0)
  })

  describe('getAllCardsOnBoard()', () => {

    it('should work with no opstions', async () => {
      const result = await trello.getCardsOnBoard({id: BOARD_ID})
      result.length.should.be.gt(0)
      console.log(result)
    })

    it('should only return the requested fields and id', async () => {
      const result = await trello.getCardsOnBoard({id: BOARD_ID, options: {fields: 'name,desc'}})
      result.length.should.be.gt(0)
      const keys = Object.keys(result[0])
      keys.length.should.equal(3)
    })

  })

  it('getCustomFieldItemsOnCard() should get the custom items', async () => {
    const result = await trello.getCustomFieldItemsOnCard(CARD_ID)
    console.log(result)
  })

  xdescribe('Custom Field Operations', () => {
    it('addCustomTextField() should add a custom text field', async () => {
      const listFieldObj = {
        idModel: BOARD_ID,
        name: 'Course Id',
        pos: 'top',
      }
      const result = await trello.addCustomTextField(listFieldObj)
      console.log(result)
    })


    it('addCustomDateField()', async () => {
      const dateFieldObj = {
        idModel: BOARD_ID,
        name: 'Start Date',
        pos: 'top',
      }
      const result = await trello.addCustomTextField(dateFieldObj)
      console.log(result)
    })


    it('deleteCustomField()', async () => {
      const result = await trello.deleteCustomField('5c9daa8eeb679211609aeb7c')
      console.log(result)
    })
  })

})

