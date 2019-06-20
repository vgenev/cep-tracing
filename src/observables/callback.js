const request = require('request-promise-native')

const Rx = require('rxjs')

module.exports.sendCallback = () => {
  return Rx.Observable.create(async observer => {
    const result = await request({
      method: 'POST',
      uri: 'http://localhost:4001/callback'
    })
    observer.next(result)
  })
}
