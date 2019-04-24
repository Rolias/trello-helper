export interface IDictObj{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface IOptions{
  options: string
}
export interface ICardFieldType{
  cardId: string
  fieldId: string
}

export interface ICustomFieldType{
  cardFieldObj: ICardFieldType
  type: string
  value: string
}

export interface IKeyTokenType{
  key: string
  token: string
}

export interface IPathOptionsType extends IOptions{
  path: string
}

export interface IPathBodyType {
  path: string
  body: string
}

export type IOptionsOrBodyType = IPathOptionsType | IPathBodyType

export interface ICardParam extends IOptions{
  cardId: string
}

export interface IActionFilterType{
  actions: IDictObj[]
  filterType: string
}

export interface IActionFilterListType{
  actions: {data: {listBefore: string}}[]
  filterList: string
}

export interface IHttpCommandType extends IOptions{
  cmd: string
}

export interface IOptionsBodyType{
  options: string
  body: string
}
export interface IBoardOptions{
  boardId: string
  options: string
}

export interface IListOptions{
  listId: string
  options: string
}

export interface IValidateType{
  obj: object
  reqKeys: string[]
}

export type IListOrBoardType = IBoardOptions | IListOptions

export interface IDefaultRestOption{
  uri: string
  qs: IKeyTokenType
  json: boolean
  resolveWithFullResponse: boolean
  options?: string
  body?: string
}

export enum OptionsBodyEnum {
  options = 'options',
  body ='body',
}