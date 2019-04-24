"use strict";
/** @module */
Object.defineProperty(exports, "__esModule", { value: true });
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
 * @typedef {{key:string, token:string}} keyTokenType
 */
/**
  // @ts-ignore
 * @typedef {{path:string,options:Object}} pathOptionsType
 */
/**
* @typedef {{cardId:string, options:object}} cardParam
*/
/**
 * @typedef {{actions:Array<Object>,filterType:string }} actionFilterType
 */
/**
 * @typedef {{actions:Array<{data:{listBefore:string}}>,filterList:string}} actionFilterListType
 */
/**
 * @typedef {{cmd:string,options:object}} httpCommandType
 */
/**
 * @typedef {{obj:Object,reqKeys:Array<string>}} validateType
 */
/**
 *
 * @typedef {{listId:string, options:string}| {boardId:string, options:string}} listOrBoardType
 */
/**
 * @typedef {{options:string, body:string}} optionsBodyType
 */
exports.optionsBodyEnum = {
    options: 'options',
    body: 'body',
};
/**
 * @param {validateType} param
 */
exports.validate = (param) => {
    // const entries = Object.entries(param)
    // console.log(entries)
    const keysInObject = Object.keys(param.obj);
    for (const key of param.reqKeys) {
        const result = keysInObject.find(e => e === key);
        if (result === undefined) {
            throw new TypeError(`Parameter must have a property named: ${key}`);
        }
    }
};
/**
 * Since we use this multiple times it gets a wrapper so we don't have
 * to specify the array of property names all the time
 * we
 * @param {Object}  param
 */
exports.validatePathOptions = param => exports.validate({ obj: param, reqKeys: ['path', 'options'] });
/**
 * Validate that object has either {path, options} or {path, body} properties
 * @param {{path:string, options:string}| {path:string, body:object}} param
 * @param {string} type
 */
exports.validateOptionsOrBody = (param, type) => exports.validate({ obj: param, reqKeys: ['path', type] });
/**
 * Just make sure object has an options property
 * @param {listOrBoardType} param
 */
exports.validateOptions = (param) => {
    const pathOptions = { obj: param, reqKeys: ['options'] };
    exports.validate(pathOptions);
};
// module.exports = {
//   validate,
//   validateOptions,
//   validatePathOptions,
//   validateOptionsOrBody,
//   optionsBodyEnum,
// }
