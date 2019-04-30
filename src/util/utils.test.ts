import {should} from 'chai'
should()
import * as moment from 'moment'
import {delay} from './utils'

describe('Utils Module Unit Test', (): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  it('delay() ', async (): Promise<any> => {
    const delayMs = 10
    const start = moment()
    await delay(delayMs)
    const stop = moment()
    const result = stop.diff(start, 'milliseconds')
    result.should.be.gte(delayMs)
  })
})