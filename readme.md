# Trello Helper

This project is designed to make using the Trello API a little easier. It extends the `trello` package and wraps many calls to use a different calling syntax. For example there is one function for `getCardsOnList()`which takes a single parameter with object property names that fully describe what the function is doing.

```javascript
getCardsOnlist({fromId:'123', withOptions:{limit:10}})
// or
getCardsOnList({fromId:'123'})
```

Additionaly tt wraps the `get`, `put` and `post` commands. It also exposes several higher level common commands needed for working with boards, lists, cards, and actions. The wrappers all use Promises (no callback syntax support) and the `async/await` syntax.

## Installation

`npm install trello-helper`

## Example Usage Authorization
```javascript
const Trello = require('trello-helper')

const trello = new Trello('/Users/ENV_VARS/trello.en.json') 
const cardsOnList = trello.getCardsOnList({fromId:'123', withOptions{}})
```

If you pass an empty string to the `Trello` constructor it will look for your credentials in the root folder of the project in a file named .env.json. If you don't want to store your credentials there, just pass the path to where they are. The credentials JSON file needs to have the following form:

```JSON
{
  "trelloHelper": {
    "appKey": "your app key",
    "token": "your token value"
  }
}
```

You can have other items in this file but `trelloHelper` must be a top-level object in the file with the indicated property names. Of course you must put in a valid app key and token for both properties.  

## Integration Tests

There are files that end with `test.int.js` that do integration testing. These are useful for seeing example calls for the commands. They are fragile in that they rely on specific ids that won't exist on your system. These ids and other fragile data is stored in the `test-data/integrations.json` file.  

## Dependencies

[`trello`](https://www.npmjs.com/package/trello)  
[`winston` logging tool](https://www.npmjs.com/package/winston)  

This library wraps the functionality of the `trello` package with added functions. In most cases where an underlying `trello` method requires multiple parameters, this wrapper takes a single object with descriptive property names.


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

## Acknowledegment

This package relies **heavily** on the `trello` package. It adds some additional calls but it also wraps some existing functions that take multiple parameters to take an object. That allows for a syntax I like where it's clear what every parameter does. I also tend to favor a naming stlye where the method and parameter property names more fully describe what is happening e.g.  

```javascript
const result = await trello.getCardsOnListWith({
  id:'123',
  options{fields:'name,id'},})
  ```