const doTimeout = ms => new Promise(res => setTimeout(res, ms))

const delay = async (ms) => await doTimeout(ms)

module.exports = {
  delay,
}