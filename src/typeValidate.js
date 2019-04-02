
/**
 * @module 
 */


/**
 * @typedef {{cardId:string, fieldId:string}} cardFieldType 
 */

/**
* @typedef {Object} customFieldType
* @property {cardFieldType} cardFieldObj
* @property {string} type
* @property {string} value
*/

/** 
  // @ts-ignore
 * @typedef {{path:string,options:Object}} pathOptionsType 
 */


/**
 * @typedef {{actions:Array<Object>,filterType:string }} actionFilterType 
 */

/**
 * @typedef {{actions:Array<{data:{listBefore:string}}>,filterList:string}} actionFilterListType 
 */

/**
 * @typedef {{cmd:string,options:Object=}} httpCommandType
 */

/**
 * @typedef {{obj:Object,reqKeys:Array<string>}} validateType
 */

/**
 * 
 * @param {validateType} param 
 */
const validate = (param) => {
  // const entries = Object.entries(param)
  // console.log(entries)
  const keysInObject = Object.keys(param.obj)

  for (const key of param.reqKeys) {
    const result = keysInObject.find(e => e === key)
    if (result === undefined) {
      throw new TypeError(`Parameter must have a property named: ${key}`)
    }
  }
}

/**
 * Since we use this multiple times it gets a wrapper so we don't have
 * to specify the array of property names all the time
 * we
 * @param {Object}  param
 */
const validatePathOptions = (param) => {
  const pathOptions = {obj: param, reqKeys: ['path', 'options']}
  validate(pathOptions)
}


module.exports = {
  validate,
  validatePathOptions,

}