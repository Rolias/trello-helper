const { createLogger, format, transports } = require('winston');
// const levels = { 
//   error: 0, 
//   warn: 1, 
//   info: 2, 
//   verbose: 3, 
//   debug: 4, 
//   silly: 5 
// };
const logger = createLogger({
    level: 'info',
    format: format.combine(format.colorize(), format.simple()),
    // You can also comment out the line above and uncomment the line below for JSON format
    // format: format.json(),
    transports: [new transports.Console()],
});
module.exports = logger;
