import { Buffer } from 'node:buffer'
import fp from 'fastify-plugin'
import { connect } from 'mqtt'

const cmd = {
  U: Buffer.from('01040000000271cb', 'hex'),
  I: Buffer.from('010400080002f009', 'hex'),
  P: Buffer.from('010400100002700e', 'hex'),
  EP: Buffer.from('0104010000027037', 'hex'),
  Hz: Buffer.from('01040036000291c5', 'hex'),
  on: Buffer.from('0110001000020440000000e763', 'hex'),
  off: Buffer.from('011000100002043f800000ff5f', 'hex'),
  nyon: Buffer.from('zqnetset1qz'),
  nyoff: Buffer.from('zqnetset0qz'),
}

let index = 0
const arr = ['U', 'I', 'P', 'EP', 'Hz']

function multPub(mq, msg) {
  query(mq, msg, () => {
    index++
    if (index === arr.length) {
      index = 0
      setTimeout(() => {
        multPub(mq, cmd[arr[index]])
      }, 180e3)
    } else {
      multPub(mq, cmd[arr[index]])
    }
  })
}

function query(mq, msg, done) {
  mq.publish(`tjjm/light/1/s`, msg)
  let count = 1
  const si = setInterval(() => {
    mq.publish(`tjjm/robot/${count++}/s`, msg)
    if (count > 12) {
      clearInterval(si)
      setTimeout(done, 3e3)
    }
  }, 100)
}

export default fp(async f => {
  const mq = connect({
    host: '124.220.195.178',
    port: 1883,
  })

  mq.on('connect', () => {
    mq.subscribe({ 'tjjm/+/+/p': { qos: 2 } })
    multPub(mq, cmd[arr[index]])
  })

  mq.on('message', (topic, msg) => {
    if (topic.includes('/robot/')) {
      return f.setRobotStore(topic, msg, arr[index])
    }
    if (topic.includes('/light/')) {
      return f.setLightStore(topic, msg, arr[index])
    }
    if (topic.includes('/db/')) {
      return f.setDbStore(topic, msg)
    }
    if (topic.includes('/ny/')) {
      return f.setNyStore(topic, msg)
    }
  })

  function setAction(topic, action) {
    mq.publish(topic, cmd[action])
  }

  f.decorate('mq', mq)
  f.decorate('setAction', setAction)
})
