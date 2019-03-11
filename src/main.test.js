const chai = require("chai"),
  {expect} = chai
chai.should()
const logger = require("./util/logger")

describe("name or description of test", () => {
  // beforeEach ( () =>{});
  // afterEach ( () =>{});
  it("should pass theses", () => {
    expect(true).to.equal(true)
  })

  it("should work with classes", () => {
    class Person {
      constructor(name) {
        this.state = {}
        this.name = name
      }
      doWork() {
        return "yay"
      }
      get name() {
        return this.state.name
      }

      set name(value) {
        this.state.name = value
      }
    }
    class Employee extends Person {
      constructor(name, title) {
        super(name)
        this.state.title = title
      }
      get title() {
        return this.state.title
      }
    }

    const e1 = new Employee("Tod", "CD")
    e1.name.should.equal("Tod")
    e1.name = "Fred"
    e1.name.should.equal("Fred")
    e1.title.should.equal("CD")
    logger.info(e1.state)
  })
})
