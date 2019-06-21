const TraceParent = require('traceparent')
const Rx = require('rxjs')
const Logger = require('@mojaloop/central-services-shared').Logger
const { tracer } = require('../lib/tracer')

const apmTracerObservable = ({ message }) => {
  return Rx.Observable.create(observable => {
    const flags = Buffer.alloc(1).fill(1)
    const version = Buffer.alloc(1).fill(0)
    const { service, traceId, parentSpanId, spanId, timestamp, endTimestamp } = message.value.metadata.trace
    const traceIdBuff = Buffer.from(traceId, 'hex')
    const spanIdBuff = Buffer.from(spanId, 'hex')
    const parentSpanIdBuff = parentSpanId && Buffer.from(parentSpanId, 'hex')
    Logger.info(`version: ${version.toString('hex')} traceId: ${traceId} spanId: ${spanId} parentSpanId: ${parentSpanId} flags: ${flags.toString('hex')}`)
    const context = parentSpanIdBuff
      ? new TraceParent(Buffer.concat([version, traceIdBuff, spanIdBuff, flags, parentSpanIdBuff]))
      : new TraceParent(Buffer.concat([version, traceIdBuff, spanIdBuff, flags]))
    let span = tracer.startSpan(`${service}`, { startTime: Date.parse(timestamp) }, context)
    tracer.startSpan()
    span.setTag('payload', message.value.content.payload)
    span.setTag('messageId', message.value.id)
    span.finish(Date.parse(endTimestamp))
    observable.next({ span })
  })
}

module.exports = {
  apmTracerObservable
}
