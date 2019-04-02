# Trello Helper - Simplifying the Trello API 

This project is designed to make using the Trello API a lot easier and to provide a lot of higher level functions to perform common tasks. It uses ES5 features. Most of the functions take a single parameter with object property names that help describe the function. This means you can't get the parameters in the wrong order. The options or body properties can often be set to just `{}`. The code is commented with `JSDoc 3` syntax so at least in Visual Studio Code the code assistance is very useful. If you use tslint or enable `// @ts-check` you will also get guidance from the editor if you don't create a correctly formatted object. 

```javascript
getCardsOnlist({listId:'123', options:{limit:10}})
// or
getCardsOnList({listId:'123', options:{}})
```

Additionally, this package wraps the `get`, `put`, `post`, and `delete` commands. But, it also exposes many higher-level  commands needed for working with boards, lists, cards, actions, and custom fields. The wrappers all use Promises (no callback syntax support), and the code uses `async/await` syntax.

## Table of Contents
- [Installation](#installation)  
- [Cheat Sheet](#cheat-sheet)  
- [Contributing](#contributing)  
- [Testing](#testing)  
- [Integration Tests](#integration-teests)  
- [Dependencies](#dependencies)  
- [Available Functions and Documenation](#available-functions)  

---

## Installation

`npm install trello-helper`

---

## Cheat Sheet

```javascript
const Trello = require('trello-helper')

const trello = new Trello('/Users/ENV_VARS/trello.env.json') 
// get all the cards on the list with id 123
const cardsOnList = trello.getCardsOnList({listId:'123', options{}})
// get all the actions on card 123 that are of type 'moveToBoard'
const mtbActions = trello.getActionsOnCard({listId:'123', filter:'moveToBoard'})
// get up to 1000 actions on a card
const actions = trello.getActionsOnCard({cardId:'123'})
// get all the custom field data for a card
const cf = trello.getCustomFieldItemsOnCard({cardId:'123'})
// set the value of a custom field 
trello.setCustomFieldValueOnCard({cardFieldObj:{
                                    {cardId:'123', fieldId:'456'}, 
                                  type:'text', 
                                  value:'some data')
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

You can have other items in this file, but `trelloHelper` must be a top-level object in the file with the 'appKey' and 'token' property names. Of course, you must put in a valid app key and token strings for both properties.  

---

## Contributing

1. clone the repo
2. npm install 

Nothing else should be required. All the scripts are in the package.json

---

### Testing

There are unit tests and integration tests  
`npm test` runs the unit tests  
`npm run test:int` runs the integration tests  
`npm run test:all` runs them both  
`npm run test:cov` runs them with coverage (by nyc)  
`npm run test:watch` runs the unit tests in watch mode  
`npm run watch` runs the unit tests and sslint in watch mode  
`npm run lint` runs eslint  
`npm run lint:watch` runs eslint in watch mode  

[back to top](#table-of-contents)

---

### Integration Tests

The files that end with `test.int.js` do integration testing. In addition to being a useful test for development, they also serve as documentation for the provided functions. They are fragile in that they rely on specific ids that won't exist on your system. These ids and other fragile data are stored in the `test-data/integrations.json` file to make it easier to run your tests.

---

## Dependencies

[winston](https://www.npmjs.com/package/winston)  logging tool  
[env-create](https://www.npmjs.com/package/env-create) reads a JSON file and turns top level elements into environment variables  
[moment](https://www.npmjs.com/package/moment) flexible handling of JavaScript dates and times  
[request](https://www.npmjs.com/package/request)
[request-promise-native](https://www.npmjs.com/package/request-promise-native)

---

## Available Functions

See the [GitHub documentation]( https://htmlpreview.github.io/?https://raw.githubusercontent.com/Rolias/trello-helper/master/documentation/module-src_trello-TrelloPlus.html) for the list of available functions and their signatures. Look for the example usage. The param section was optimized for code assistance and type script and it makes the JSDoc runner just show a type of `Object` even though the underlying comment spells out all the proper property names. I figured you'll use the code assist feature a lot more than the documentation but the @example tags do show all the property names.

---
[back to top](#table-of-contents)