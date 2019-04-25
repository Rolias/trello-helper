
import * as I from './Interfaces'
// type guard to tell if it's  IListOptions object
export const hasListId = (item: I.IListOrBoardType): item is I.IListOptions =>
  (item as I.IListOptions).listId !== undefined
