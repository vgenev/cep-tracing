// const agent = require('elastic-apm-node').start()
// const Tracer = require('elastic-apm-node-opentracing')
const TraceParent = require('traceparent')
const Rx = require('rxjs')
const Logger = require('@mojaloop/central-services-shared').Logger
// const GenericSpan = require('elastic-apm-node')
const { tracer } = require('../lib/tracer')
const crypto = require('crypto')

const apmTracerObservable = ({ message }) => {
  return Rx.Observable.create(observable => {
    // const tracer = new Tracer(agent)
    const flags = Buffer.alloc(1).fill(1)
    const version = Buffer.alloc(1).fill(0)
    const { service, traceId, parentSpanId, spanId, timestamp, endTimestamp } = message.value.metadata.trace

    //
    // const action = message.value.metadata.event.action TODO apply the action for start and stop
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // TODO findout why span vs transaction is having troubles (maybe because current transaction is always ended????)
    //

    // if (agent.currentTransaction.traceparent )

    const traceIdBuff = Buffer.from(traceId, 'hex')
    const spanIdBuff = Buffer.from(spanId, 'hex')
    const parentSpanIdBuff = Buffer.from(parentSpanId, 'hex')
    Logger.info(`version: ${version.toString('hex')} traceId: ${traceId} spanId: ${spanId} parentSpanId: ${parentSpanId} flags: ${flags.toString('hex')}`)
    const spanId2Buff = Buffer.from(crypto.randomBytes(8))
    const spanId3Buff = Buffer.from(crypto.randomBytes(8))
    const context = new TraceParent(Buffer.concat([version, traceIdBuff, spanIdBuff, flags, parentSpanIdBuff]))
    const childContext = new TraceParent(Buffer.concat([version, traceIdBuff, spanId2Buff, flags, spanIdBuff]))
    const child2Context = new TraceParent(Buffer.concat([version, traceIdBuff, spanId3Buff, flags, spanId2Buff]))
    let span2 = tracer.startSpan(`${service}-x`, {}, childContext)
    span2.finish()
    let span = tracer.startSpan(`${service}-z`, { startTime: Date.parse(timestamp) }, context)
    span.finish(Date.parse(endTimestamp))
    let span3 = tracer.startSpan(`${service}-c`, {}, child2Context)
    span3.finish()
    observable.next({ span, span2, span3 })
  })
}
// 
module.exports = {
  apmTracerObservable
}

/*
let span1 = tracer.startSpan('name-1', {options: 1}, context)

console.log(span1.context())
span1.finish()
const message = {}
tracer.inject(span1.context(), 'text_map', message)

console.log(`message: ${message}`)

let spanContext = tracer.extract('text_map', message)

let span = tracer.startSpan('name-2', {
  childOf: spanContext
})

console.log(span.context())
span.finish()
*/
