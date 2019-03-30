const rpn = require('request-promise-native')


const test = async () => {

  // const options = {
  //   method: 'PUT',
  //   uri: 'https://api.trello.com/1/card/5c9e7f54777608079ccfafad/customField/5c9e6860ea48a783c20de612/item?key=3f4f69696c7f80bfcd6e87fd8d97f7ab&token=38340d4906c91a25c8e9398dddd1ec1fde27b45ec9908f1d927317b5982690c7',
  //   body: {value: {text: 'tod e gentille'}},
  //   json: true,
  // }

  // const result = await rpn(options)
  // console.log(result)

  const keyTokenObj = {
    key: '3f4f69696c7f80bfcd6e87fd8d97f7ab',
    token: '38340d4906c91a25c8e9398dddd1ec1fde27b45ec9908f1d927317b5982690c7',
  }
  const trelloOption = {limit: 1}

  const queryStringObj = {...keyTokenObj, ...trelloOption}
  console.log(queryStringObj)

  const optionsGet = {
    // method: 'GET',
    uri: 'https://api.trello.com/1/list/5c9a9d8afcf46f3f1fdb6698/cards',
    qs: queryStringObj,
    resolveWithFullResponse: true,
  }
  const getReq = await rpn.get(optionsGet)
    .catch(error => {
      console.log(error)
    })
  console.log(getReq.statusCode, getReq.body)

}

test()