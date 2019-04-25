import * as moment from 'moment'

export type CmdFunc = (id: string) => string
export interface IDictObj{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface IOptions{
  options: IDictObj
}

export interface ICardId{
  cardId: string
}
export interface ICardFieldType extends ICardId{
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
  body: IDictObj
}

export type IOptionsOrBodyType = IPathOptionsType | IPathBodyType

export interface ICardOptionsType extends IOptions{
  cardId: string
}

export interface ITrelloAction {
  type: string
}
export interface IActionFilterType {
  actions: ITrelloAction[]
  filterType: string
}

export interface IActionFilterListType{
  actions: {data: {listBefore: string}}[]
  filterList: string
}

export interface IHttpCommandType {
  cmd: string
  options: string
}

export interface IOptionsBodyType{
  options: string
  body: string
}
export interface IBoardOptions extends IOptions, IDictObj{
  boardId: string
}

export interface IListId{
  listId: string
}

export type IListOptions =IListId & IOptions & IDictObj

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
  options?: IDictObj
  body?: IDictObj
}

export interface IArchiveOffset{
  listId: string,
  offset: {
    count: moment.DurationInputArg1,
    units: moment.DurationInputArg2,
  }
}

export interface ICardDueDateOffset{
  cardId: string
  offset: {
    count: moment.DurationInputArg1
    units: moment.DurationInputArg2 // e.g. `days, months, years, quarters, hours, minutes`
  }
}

export interface ICardMemberType{
  cardId: string
  memberId: string
}

export interface ITrelloMemberData{
  id: string,
  fullName: string,
  username: string,
}

export interface IListBefore{
  data: {
    listBefore: string
  }
}
export interface ITrelloListBefore {
  actions:
  {
    data: {
      listBefore: string
    }
  }[]
  ,
  filterList: string
}
export type ITrelloPromise = Promise<IDictObj[]>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IRestPromise = Promise<any>

export enum OptionsBodyEnum {
  options = 'options',
  body ='body',
}

export enum RestCommands{
  delete = 'delete',
  get= 'get',
  post = 'post',
  put ='put'
}

export enum CustomFieldType{
  list = 'list',
  text = 'text',
  number = 'number',
  date = 'date',
  checkbox = 'checked'
}