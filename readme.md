# Trello Helper

This project is designed to make using the Trello API a little easier. It wraps the `get`, `put` and `post`
commands. It also exposes higher level common commands needed for working with lists and cards. All functions are asynchronous and can use the `async/await` syntax.

## Installation

`npm install trello-helper`

## Example Usage Authorization
```javascript
const Trello = require('trello-helper')

const trello = new Trello('/Users/ENV_VARS/trello.en.json') 
const cardsOnList = trello.getCardsOnList(LIST_ID)
```
If you pass an empty string to the `Trello` constructor it will look for your credentials in the root folder of the project in a file named .env.json. If you don't want to store your credentials there just pass the path to where they are. The credentials JSON file needs to have the following form:

```JSON
{
  "trelloHelper": {
    "appKey": "your app key",
    "token": "your token value"
  }
}
```

You can have other items in this file but `trelloHelper` must be a top-level object in the file with the indicated property names. Of course you must put in a valid app key and token for both properties.  

## Dependencies

[`trello`](https://www.npmjs.com/package/trello)  
[`winston` logging tool](https://www.npmjs.com/package/winston)  

This library wraps the functionality of the `trello` package with added functions. In most cases where an underlying `trello` method requires multiple parameters, this wrapper takes a single object with descriptive property names. For example `getCardsOnListWith(param)` looks like  
`getCardsOnListWith({id:'123', options:{fields:'name,id'}})`  

- `getAllActionsOnCard(cardId)` - returns the array of actions
- `getCardsOnListWith(param)` 
- `getArchivedCards(param)` - get all the archived cards for the passed board that belong to the passed id  
- `wasOnList` - takes an array of actions and returns the ones that have a listBefore property that matches the passed listName 
- `get(path,options)`
- `put(path,options)`
- `post(path,options)`
- `getMoveCardToBoardInfo(actions)`
- `setDueComplete(param)`
- `addCard(param)`
