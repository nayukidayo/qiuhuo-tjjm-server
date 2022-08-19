import fp from 'fastify-plugin'

const data = {}
const cache = {}

function setNyStore(topic, msg) {
  const item = {
    time: Date.now(),
    data: JSON.parse(msg.toString()),
  }
  const arr = data[topic]
  if (arr) {
    if (arr.length === 5) {
      arr.shift()
    }
    arr.push(item)
  } else {
    data[topic] = [item]
  }
}
function setDbStore(topic, msg) {
  setNyStore(topic, msg)
}
function setLightStore(topic, msg, attr) {
  if (msg[1] !== 4) return
  if (!cache[topic]) {
    cache[topic] = {}
  }
  cache[topic][attr] = msg.subarray(3, 7).readFloatBE()
  if (attr !== 'Hz') return
  const item = {
    time: Date.now(),
    data: cache[topic],
  }
  const arr = data[topic]
  if (arr) {
    if (arr.length === 5) {
      arr.shift()
    }
    arr.push(item)
  } else {
    data[topic] = [item]
  }
}
function setRobotStore(topic, msg, attr) {
  setLightStore(topic, msg, attr)
}

function getStore(topic) {
  return data[topic]
}

export default fp(async f => {
  f.decorate('setNyStore', setNyStore)
  f.decorate('setDbStore', setDbStore)
  f.decorate('setLightStore', setLightStore)
  f.decorate('setRobotStore', setRobotStore)
  f.decorate('getStore', getStore)
})
