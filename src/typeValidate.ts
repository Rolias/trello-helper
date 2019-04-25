import {IValidateType,
  IPathOptionsType,
  IOptionsOrBodyType,
  IListOrBoardType} from './Interfaces'

/**
 * @param {validateType} param
 */
export const validate = (param: IValidateType): void => {
  const keysInObject = Object.keys(param.obj)

  for (const key of param.reqKeys) {
    const result = keysInObject.find((e): boolean => e === key)
    if (result === undefined) {
      throw new TypeError(`Parameter must have a property named: ${key}`)
    }
  }
}

/**
 * Since we use this multiple times it gets a wrapper so we don't have
 * to specify the array of property names all the time
 * we
 */
export const validatePathOptions = (param: IPathOptionsType): void  =>
  validate({obj: param, reqKeys: ['path', 'options']})


/**
 * Validate that object has either {path, options} or {path, body} properties
 */
export const validateOptionsOrBody = (param: IOptionsOrBodyType, type: string): void =>
  validate({obj: param, reqKeys: ['path', type]})


/**
 * Just make sure object has an options property
 * @param {listOrBoardType} param
 */
export const validateOptions = (param: IListOrBoardType): void => {
  const pathOptions = {obj: param, reqKeys: ['options']}
  validate(pathOptions)
}
