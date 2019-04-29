import * as moment from 'moment'

export interface DictObj{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface Options{
  options: DictObj
}

export interface OptionsMaybe{
  options?: DictObj
}

export interface CardId{
  cardId: string
}
export interface CardFieldType extends CardId{
  fieldId: string
}

export interface TypeValueType{
  type: string
  value: string
}

export interface CustomFieldType extends TypeValueType{
  cardFieldObj: CardFieldType
}

export interface CustomFieldValueObject {
  idValue?: string
  value?: DictObj
}

export interface KeyTokenType{
  key: string
  token: string
}

export interface PathOptionsType extends OptionsMaybe{
  path: string
}

export interface PathBodyType {
  path: string
  body: DictObj
}

export type OptionsOrBodyType = PathOptionsType | PathBodyType

export interface CardOptionsType extends OptionsMaybe{
  cardId: string
}

export interface TrelloAction {
  type: string
}
export interface ActionFilterType {
  actions: TrelloAction[]
  filterType: string
}

export interface ActionFilterListType{
  actions: {data: {listBefore: string}}[]
  filterList: string
}

export interface HttpCommandType {
  cmd: string
  options: string
}

export interface OptionsBodyType{
  options: string
  body: string
}
export interface BoardOptions extends OptionsMaybe, DictObj{
  boardId: string
}

export interface ListId{
  listId: string
}

export type ListOptions =ListId & OptionsMaybe & DictObj

export interface ValidateType{
  obj: object
  reqKeys: string[]
}
export type ListOrBoardType = BoardOptions | ListOptions

export interface DefaultRestOption{
  uri: string
  qs: KeyTokenType
  json: boolean
  resolveWithFullResponse: boolean
  options?: DictObj
  body?: DictObj
}

export interface ArchiveOffset{
  listId: string,
  offset: {
    count: moment.DurationInputArg1,
    units: moment.DurationInputArg2,
  }
}

export interface CardDueDateOffset{
  cardId: string
  offset: {
    count: moment.DurationInputArg1
    units: moment.DurationInputArg2 // e.g. `days, months, years, quarters, hours, minutes`
  }
}

export interface CardMemberType{
  cardId: string
  memberId: string
}

export interface TrelloMemberData{
  id: string,
  fullName: string,
  username: string,
}

export interface ListBefore{
  data: {
    listBefore: string
  }
}
export interface TrelloListBefore {
  actions:
  {
    data: {
      listBefore: string
    }
  }[]
  ,
  filterList: string
}
export type TrelloPromise = Promise<DictObj[]>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RestPromise = Promise<any>

