
Almost all this worked (not the list stuff) but it doesn't seem that it's worth doing this type of stuff
through the API. Need to be able to read and write the custom fields but not create and manipulate them

```javascript
 // ========================== Custom Fields ======================================
  // All of the following commands require the custom fields powerup be active
  // on the board where the custom objects are used
  // ===============================================================================
  getCustomFieldEndpoint() {return '/1/customFields'}

  /**
  * @typedef {Object} customFieldObj
  * @property {string} idModel - always a board id
  * @property {string} modelType - always "board"
  * @property {string} name  - name displayed to user
  * @property {Array<Object>} options 
  * @property {string} pos -  "top", "bottom" or a positive integer
  * @property {string} type = checkbox, date, list, number, text
  */

  /**
   * @typedef {Object} nonListFieldObj
   * @property {string} idModel
   * @property {string} name - field name shown to user
   * @property {string} pos
   */

  /**
  * @typedef {Object} listFieldObj
  * @property {string} idModel
  * @property {string} name - field name shown to user
  * @property {Array<Object>} options
  * @property {string} pos
  */

  /**
   * Create a custom text object
   * @param {nonListFieldObj} fieldObj 
   */
  addCustomTextField(fieldObj) {
    const textObj = {modelType: 'board', type: 'text', options: []}
    /**  @type {customFieldObj} */
    const fullObj = {...textObj, ...fieldObj}
    return this.addCustomField(fullObj)
  }

  /**
   * Create a custom date obj
   * @param {nonListFieldObj} fieldObj 
  */
  addCustomDateField(fieldObj) {
    const dateObj = {modelType: 'board', type: 'date', options: []}
    /**  @type {customFieldObj} */
    const fullObj = {...dateObj, ...fieldObj}
    return this.addCustomField(fullObj)
  }

  /**
  * Create a custom checkbox obj
  * @param {nonListFieldObj} fieldObj 
  */
  addCustomCheckboxField(fieldObj) {
    const dateObj = {modelType: 'board', type: 'checkbox', options: []}
    /**  @type {customFieldObj} */
    const fullObj = {...dateObj, ...fieldObj}
    return this.addCustomField(fullObj)
  }

  /**
   * Create a custom list obj
   * @param {listFieldObj} fieldObj 
   * FIXME - not sure why this won't work - seems correct per documentation
   * Something about the options object is not right
   */
  addCustomListField(fieldObj) {
    const listObj = {modelType: 'board', type: 'list'}
    /**  @type {customFieldObj} */
    const fullObj = {...listObj, ...fieldObj}
    return this.addCustomField(fullObj)
  }

  /** @param {customFieldObj} fullFieldObj */
  addCustomField(fullFieldObj) {
    const cmd = this.getCustomFieldEndpoint()
    return this.post(cmd, fullFieldObj)
  }

  deleteCustomField(fieldId) {
    const cmd = `${this.getCustomFieldEndpoint()}/${fieldId}`
    return this.delete(cmd)
  }

  addItemToList(listId) {
    const cmd = `${this.getCustomFieldEndpoint()}/${listId}`
  }
  ```

  These were the integration tests that had been written
  ```javascript
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
      const result = await trello.addCustomDateField(dateFieldObj)
      console.log(result)
    })


    it('deleteCustomField()', async () => {
      const result = await trello.deleteCustomField('5c9daa8eeb679211609aeb7c')
      console.log(result)
    })
  })
  ```