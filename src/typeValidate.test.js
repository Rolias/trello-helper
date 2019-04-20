const chai = require('chai')
const should = chai.should()
const tv = require('./typeValidate')

// NOTE - the majority of the validate module is tested by higher level 
// modules. This is just for testing that it throws with bad input
describe('validate (wee bits) UNIT TEST', () => {
  it('validate() should throw when expected property not found', () => {
    /** @type tv.validateType */
    const object = {
      obj: {key: '1'},
      reqKeys: ['options'],
    }
    should.throw(tv.validate.bind(this, object))
  })
})