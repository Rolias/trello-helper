# Trello Helper

This project is designed to make using the Trello API a little easier. It extends the `trello` npm package and wraps many calls to use a different calling syntax. For example, there is one function for `getCardsOnList()` which takes a single parameter with object property names that fully describe what the function is doing.

```javascript
getCardsOnlist({fromId:'123', withOptions:{limit:10}})
// or
getCardsOnList({fromId:'123'})
```

Additionally, this package wraps the `get`, `put` and `post` commands. It also exposes several higher level common commands needed for working with boards, lists, cards, and actions. The wrappers all use Promises (no callback syntax support), and the `async/await` syntax.

## Installation

`npm install trello-helper`

## Example Usage Authorization

```javascript
const Trello = require('trello-helper')

const trello = new Trello('/Users/ENV_VARS/trello.en.json') 
const cardsOnList = trello.getCardsOnList({fromId:'123', withOptions{}})
```

If you pass an empty string to the `Trello` constructor, it will look for your credentials in the root folder of the project in a file named .env.json. If you don't want to store your credentials there, pass the path to where they are. The credentials JSON file needs to have the following form:

```JSON
{
  "trelloHelper": {
    "appKey": "your app key",
    "token": "your token value"
  }
}
```

You can have other items in this file, but `trelloHelper` must be a top-level object in the file with the indicated property names. Of course, you must put in a valid app key and token for both properties.  

## Integration Tests

The files that end with `test.int.js` do integration testing. In addition to being a useful test for development they useful serve as documentation for the provided functions. They are fragile in that they rely on specific ids that won't exist on your system. These ids and other fragile data are stored in the `test-data/integrations.json` file.

## Dependencies

[`trello`](https://www.npmjs.com/package/trello)  
[`winston`](https://www.npmjs.com/package/winston)  logging tool
[env-create](https://www.npmjs.com/package/env-create) reads a JSON file and turns top level elements into environment variables
[moment](https://www.npmjs.com/package/moment) flexible handling of JavaScript dates and times

## Quick Cheat Sheet (not comprehensive)

- see the [documentation folder in github](https://github.com/Rolias/trello-helper/tree/master/documentation) for the most accurate information.

- `getAllActionsOnCard(cardId)` - returns the array of actions
- `getCardsOnListWith(param)` 
- `getArchivedCards(param)` - get all the archived cards for the passed board that belong to the passed id  
- `wasOnList` - takes an array of actions and returns the ones that have a listBefore property that matches the passed listName 
- `get(path,options)`
- `put(path,options)`
- `post(path,options)`
- `getMoveCardToBoardInfo(actions)` - pass an array of actions and get back the "MoveCardToBoard" actions
- `setDueComplete(param)`
- `addCard(param)`