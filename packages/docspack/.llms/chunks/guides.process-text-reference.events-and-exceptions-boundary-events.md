# BPMN Kit Text — element reference — Events and exceptions — Boundary events

A boundary starts its own line, names its task with `on=`, and leads only to the handling. By default
it interrupts the task. `nonint` keeps the task running.

```bpmnkit-text
# Timeout on a task
s[start Request] > work[user Do the work] > e[end Done]
late[boundary:timer Too slow | on=work after=PT2H] > nudge[send Remind owner | job=remind] > e2[end Reminded]
```

```typescript
const defs = Bpmn.createProcess("boundary-timer")
  .name("Timeout on a task")
  .startEvent("s", { name: "Request" })
  .userTask("work", { name: "Do the work" })
  .withBoundary("late", { name: "Too slow", timerDuration: "PT2H" }, (b) =>
    b.sendTask("nudge", { name: "Remind owner", taskType: "remind" }).endEvent("e2", { name: "Reminded" }),
  )
  .endEvent("e", { name: "Done" })
  .build()
```

An error boundary catches the error an inner step raises, matched by `error=`:

```bpmnkit-text
# Error on a task
s[start Order] > pay[service Pay | job=pay] > e[end Paid]
failed[boundary:error Payment failed | on=pay error=PAY_FAILED] > notify[send Tell submitter | job=notify] > e2[end Failed]
```

```typescript
const defs = Bpmn.createProcess("boundary-error")
  .name("Error on a task")
  .startEvent("s", { name: "Order" })
  .serviceTask("pay", { name: "Pay", taskType: "pay" })
  .withBoundary("failed", { name: "Payment failed", errorCode: "PAY_FAILED" }, (b) =>
    b.sendTask("notify", { name: "Tell submitter", taskType: "notify" }).endEvent("e2", { name: "Failed" }),
  )
  .endEvent("e", { name: "Paid" })
  .build()
```

A non-interrupting boundary (`nonint`) fires beside the task:

```bpmnkit-text
# Reminder beside a task
s[start Request] > work[user Do the work] > e[end Done]
nudge[boundary:timer One hour | on=work after=PT1H nonint] > ping[send Remind | job=remind] > e2[end Reminded]
```

```typescript
const defs = Bpmn.createProcess("boundary-nonint")
  .name("Reminder beside a task")
  .startEvent("s", { name: "Request" })
  .userTask("work", { name: "Do the work" })
  .withBoundary("nudge", { name: "One hour", timerDuration: "PT1H", cancelActivity: false }, (b) =>
    b.sendTask("ping", { name: "Remind", taskType: "remind" }).endEvent("e2", { name: "Reminded" }),
  )
  .endEvent("e", { name: "Done" })
  .build()
```

`boundary:message`, `boundary:signal`, `boundary:escalation`, `boundary:conditional`,
`boundary:compensate` and `boundary:cancel` work the same way, with the matching `msg=`/`key=`,
`signal=`, `escalation=` attribute where one is needed.

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
