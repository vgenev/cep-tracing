const Rx = require('rxjs')
const { initTracer } = require('../lib/tracer')
const config = require('../lib/config')

// let { consturctTracer } = require('../../../central-services-stream/src/kafka/zipkin/tracer')
// let { updateConsumerTracerStart, updateConsumerTracerStop } = require('../../../central-services-stream/src/kafka/zipkin/instruments')

// const { Tracer, ExplicitContext, BatchRecorder, ConsoleRecorder, jsonEncoder: { JSON_V2 }, createNoopTracer } = require('zipkin')
// const recorder = new BatchRecorder({
//   logger: new HttpLogger({
//     endpoint: `http://localhost:9411/api/v2/spans`,
//     httpInterval: 1000, // how often to sync spans. optional, defaults to 1000
//     jsonEncoder: JSON_V2
//     // headers: { 'Authorization': 'secret' } // optional custom HTTP headers
//   })
// })

const openTracerObservable = (message) => {
  return Rx.Observable.create(async observable => {
    const tracer = initTracer(message.value.metadata.trace.service)
    const span = tracer.startSpan('trace-payload')
    
    observable.next()
  })
}

module.exports = {
  openTracerObservable
}
