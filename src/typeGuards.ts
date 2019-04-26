
import * as I from './Interfaces'
// type guard to tell if it's  IListOptions object
export const hasListId = (item: I.ListOrBoardType): item is I.ListOptions =>
  (item as I.ListOptions).listId !== undefined
