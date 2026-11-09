# Building Processes — Events

### Start Events

```typescript
// None start
.startEvent("start")

// Timer start (runs on a schedule)
.startEvent("start-daily", {
  timer: { timeCycle: "R/PT24H" },   // ISO 8601 repeating interval
})

// Message start
.startEvent("start-on-order", {
  message: { name: "order-received", correlationKey: "= orderId" },
})
```

### Intermediate Events

```typescript
// Catch a timer (delay)
.intermediateCatchEvent("wait-1h", { timerDuration: "PT1H" })

// Catch a message (wait for external signal)
.intermediateCatchEvent("wait-for-payment", {
  messageName: "payment-confirmed",
  correlationKey: "= orderId",
})

// Throw a message: Camunda 8 hands it to a job worker, so it needs a taskType
.intermediateThrowEvent("notify-warehouse", {
  messageName: "order-ready",
  taskType: "publish-order-ready",
})
```

Link events are a "go-to" inside one process or sub-process: a link throw continues at the link
catch with the same name. The throw has no outgoing flow and the catch no incoming one, so the
builder stops chaining at the throw and starts a new chain at the catch:

```typescript
.serviceTask("check", { name: "Check", taskType: "check" })
.intermediateThrowEvent("to-retry", { linkName: "Retry" })    // nothing chains from here
.intermediateCatchEvent("from-retry", { linkName: "Retry" })  // starts a new chain
.serviceTask("retry", { name: "Retry", taskType: "retry" })
```

### End Events

```typescript
// Normal end
.endEvent("end")

// Error end (triggers error boundary event)
.endEvent("end-error", { errorCode: "PAYMENT_FAILED" })

// Message end: a job worker publishes the message, so it needs a taskType
.endEvent("end-notify", {
  messageName: "process-complete",
  taskType: "publish-process-complete",
})
```

---
Source: https://bpmnkit.com/docs/guides/building-processes
