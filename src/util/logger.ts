import {createLogger, format, transports} from 'winston'
import winston = require('winston');
// For references the levels are
// error 0
// warn 1
// info 2
// verbose 3
// debug 4
// silly 5
const logger: winston.Logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.simple()
  ),
  // You can also comment out the line above and uncomment the line below for JSON format
  // format: format.json(),
  transports: [new transports.Console()],
})

export {logger}

// module.exports = logger