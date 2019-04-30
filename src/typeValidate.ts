
import * as I from './Interfaces'

/**
 * @param {validateType} param
 */
export const validate = (param: I.ValidateType): void => {
  const keysInObject = Object.keys(param.obj)

  for (const key of param.reqKeys) {
    const result = keysInObject.find((e): boolean => e === key)
    if (result === undefined) {
      throw new TypeError(`Parameter must have a property named: ${key}`)
    }
  }
}

export const validatePath = (param: I.PathOptionsType): void => {
  validate({obj: param, reqKeys:['path']})
}
/**
 * Since we use this multiple times it gets a wrapper so we don't have
 * to specify the array of property names all the time
 * we
 */
export const validatePathOptions = (param: I.PathOptionsType): void  =>
  validate({obj: param, reqKeys: ['path', 'options']})


/**
 * Validate that object has either {path, options} or {path, body} properties
 */
export const validatePathBody = (param: I.PathBodyType): void =>
  validate({obj: param, reqKeys: ['path', 'body']})


/**
 * Just make sure object has an options property
 * @param {listOrBoardType} param
 */
export const validateOptions = (param: I.ListOrBoardType): void => {
  const pathOptions = {obj: param, reqKeys: ['options']}
  validate(pathOptions)
}

