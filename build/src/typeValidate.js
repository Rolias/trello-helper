"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// export const optionsBodyEnum = {
//   options: 'options',
//   body: 'body',
// }
/**
 * @param {validateType} param
 */
exports.validate = (param) => {
    const keysInObject = Object.keys(param.obj);
    for (const key of param.reqKeys) {
        const result = keysInObject.find((e) => e === key);
        if (result === undefined) {
            throw new TypeError(`Parameter must have a property named: ${key}`);
        }
    }
};
/**
 * Since we use this multiple times it gets a wrapper so we don't have
 * to specify the array of property names all the time
 * we
 */
exports.validatePathOptions = (param) => exports.validate({ obj: param, reqKeys: ['path', 'options'] });
/**
 * Validate that object has either {path, options} or {path, body} properties
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
