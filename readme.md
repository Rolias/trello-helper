# Trello Helper

This project is designed to make using the Trello API a little easier. It wraps the `get`, `put` and `post`
commands. It also exposes higher level common commands needed for working with lists and cards.  

## Installation

`npm install trello-helper`

## Authorization

When you require this package you should immediately call the `auth` routine and pass in the path to your json file that contains your credentials. If you store those at the root level of the project and name it .env.json you can just call `auth()` with no parameter. The structure of the JSON file is as follows:

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

`node-trello` 
`winston` logging tool
