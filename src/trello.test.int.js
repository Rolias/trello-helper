const trello = require("./trello")

const GREENLIGHT_LIST_ID = "55c3cdfb267cd03b23d104c6";
const GET_GREENLIGHT_LIST_CARDS = trello.getCardsFromListIdCmd(GREENLIGHT_LIST_ID)

const result = trello.get(GET_GREENLIGHT_LIST_CARDS)
console.log(result)