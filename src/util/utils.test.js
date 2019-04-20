const chai = require('chai')
chai.should()
const moment = require('moment')
const myUtils = require('./utils')

describe('Utils Module Unit Test', () => {

  it('delay() ', async () => {
    const delayMs = 10
    const start = moment()
    await myUtils.delay(delayMs)
    const stop = moment()
    const result = stop.diff(start, 'milliseconds')
    result.should.be.gte(delayMs)
  })
})