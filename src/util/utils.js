const timeout = ms => new Promise(res => setTimeout(res, ms))


const delay = async (ms) => {
  await timeout(ms)
}
module.exports = {
  delay,
}