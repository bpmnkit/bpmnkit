---
title: BPMN Kit Text — element reference
description: Every element of BPMN Kit Text with a rendered diagram, the line that writes it and the BPMN Kit Fluent code that builds the same thing. Tasks, gateways, events, boundaries, pools, lanes and ad-hoc agents.
sidebar:
  order: 1
---

## How to read this page

Each element has a short note, a `bpmnkit-text` block and its [BPMN Kit Fluent](/docs/guides/fluent-builder)
equivalent. The text block is rendered to a diagram when the site is built, so what you see is what
`parseProcessText` reads. A test parses every block on this page and builds every Fluent snippet.

- The line format is explained in [BPMN Kit Text — the line format](/docs/guides/process-text).
- Fluent snippets assume `import { Bpmn } from "@bpmnkit/core"` and end in `.build()`.
- A node is `id[kind Name | attributes]`. Write the bracket the first time; afterwards write only `id`.
- Text fills in what it can leave out: ids, join gateways, a missing end event. Fluent states every id.

## Process basics and tasks

The first line is `# Process name`. A path is `a > b > c`. A start event, an end event and one task
make the smallest process.

```bpmnkit-text
# Smallest process
begin[start Begin] > work[task Do the work] > finish[end Finish]
```

```typescript
const defs = Bpmn.createProcess("smallest")
  .name("Smallest process")
  .startEvent("begin", { name: "Begin" })
  .task("work", { name: "Do the work" })
  .endEvent("finish", { name: "Finish" })
  .build()
```

### `user` — a person does it

`form=` links a form. `user` also reads the aliases `human`.

```bpmnkit-text
# User task
s[start Request] > review[user Review request | form=review_form] > e[end Reviewed]
```

```typescript
const defs = Bpmn.createProcess("user-task")
  .name("User task")
  .startEvent("s", { name: "Request" })
  .userTask("review", { name: "Review request", formId: "review_form" })
  .endEvent("e", { name: "Reviewed" })
  .build()
```

### `service` — a worker runs a job

`job=` is the job type the worker subscribes to. `result=` names the variable that holds the result.

```bpmnkit-text
# Service task
s[start Order placed] > pay[service Charge card | job=charge-card result=receipt] > e[end Paid]
```

```typescript
const defs = Bpmn.createProcess("service-task")
  .name("Service task")
  .startEvent("s", { name: "Order placed" })
  .serviceTask("pay", { name: "Charge card", taskType: "charge-card", ioMapping: { outputs: [{ source: "= result", target: "receipt" }] } })
  .endEvent("e", { name: "Paid" })
  .build()
```

### `rule` — a DMN decision

`rule` is a business rule task. The aliases `decision` and `dmn` mean the same.

```bpmnkit-text
# Rule task
s[start Loan asked] > score[rule Score applicant | result=score] > e[end Scored]
```

```typescript
const defs = Bpmn.createProcess("rule-task")
  .name("Rule task")
  .startEvent("s", { name: "Loan asked" })
  .businessRuleTask("score", { name: "Score applicant", decisionId: "applicant-score", resultVariable: "score" })
  .endEvent("e", { name: "Scored" })
  .build()
```

### `script` — FEEL on process data

Use a script task for work that only reads variables: count, sum, filter, format. `feel=` is last on
the line and takes the rest of it.

```bpmnkit-text
# Script task
s[start Counted] > count[script Count open | result=openCount feel=count(issues[state = "open"])] > e[end Done]
```

```typescript
const defs = Bpmn.createProcess("script-task")
  .name("Script task")
  .startEvent("s", { name: "Counted" })
  .scriptTask("count", { name: "Count open", expression: '= count(issues[state = "open"])', resultVariable: "openCount" })
  .endEvent("e", { name: "Done" })
  .build()
```

### `send` and `receive` — messages

A `send` task publishes a message. A `receive` task waits for one: it needs `msg=` and `key=`.

```bpmnkit-text
# Send and receive
s[start Order shipped] > tell[send Tell customer | job=notify] > wait[receive Wait for reply | msg=reply key=orderId] > e[end Replied]
```

```typescript
const defs = Bpmn.createProcess("send-receive")
  .name("Send and receive")
  .startEvent("s", { name: "Order shipped" })
  .sendTask("tell", { name: "Tell customer", taskType: "notify" })
  .receiveTask("wait", { name: "Wait for reply", messageName: "reply", correlationKey: "= orderId" })
  .endEvent("e", { name: "Replied" })
  .build()
```

### `manual` and `task`

`manual` is work done outside the engine. `task` is the plain task with no type.

```bpmnkit-text
# Manual and plain
s[start Parcel arrived] > pack[manual Pack parcel] > log[task Log it] > e[end Done]
```

```typescript
const defs = Bpmn.createProcess("manual-plain")
  .name("Manual and plain")
  .startEvent("s", { name: "Parcel arrived" })
  .manualTask("pack", { name: "Pack parcel" })
  .task("log", { name: "Log it" })
  .endEvent("e", { name: "Done" })
  .build()
```

### `call` — another process

`called=` is the id of the process to call. `in.` and `out.` map variables in and out of the call.

```bpmnkit-text
# Call activity
s[start Order] > bill[call Bill customer | called=billing in.amount=total out.invoice=invoiceId] > e[end Billed]
```

```typescript
const defs = Bpmn.createProcess("call-activity")
  .name("Call activity")
  .startEvent("s", { name: "Order" })
  .callActivity("bill", {
    name: "Bill customer",
    processId: "billing",
    ioMapping: { inputs: [{ source: "= total", target: "amount" }], outputs: [{ source: "= invoiceId", target: "invoice" }] },
  })
  .endEvent("e", { name: "Billed" })
  .build()
```

### `each=` — once per item

`each=<list>` runs the task once for every item of the list (a multi-instance task).

```bpmnkit-text
# For each item
s[start Order] > pick[service Pick item | job=pick each=items] > e[end Picked]
```

```typescript
const defs = Bpmn.createProcess("for-each")
  .name("For each item")
  .startEvent("s", { name: "Order" })
  .serviceTask("pick", { name: "Pick item", taskType: "pick", multiInstance: { collection: "= items", elementVariable: "item" } })
  .endEvent("e", { name: "Picked" })
  .build()
```

## Gateways

A gateway has one line for the path into it and one line for each branch out of it. A branch is
`gw >(Label: FEEL condition) next`. Exactly one branch of an `xor` is `(Label: default)`.

### `xor` — exactly one branch

`xor` reads the aliases `exclusive` and `gateway`.

```bpmnkit-text
# Exclusive choice
s[start Expense] > check[xor Over 1000?]
check >(Yes: amount > 1000) review[user Review] > e[end Paid]
check >(No: default) auto[service Approve | job=approve] > e
```

```typescript
const defs = Bpmn.createProcess("xor")
  .name("Exclusive choice")
  .startEvent("s", { name: "Expense" })
  .exclusiveGateway("check", { name: "Over 1000?" })
  .branch("Yes", (b) => b.condition("= amount > 1000").userTask("review", { name: "Review" }).endEvent("e", { name: "Paid" }))
  .branch("No", (b) => b.defaultFlow().serviceTask("auto", { name: "Approve", taskType: "approve" }).connectTo("e"))
  .build()
```

The two branches meet at `e`. Text joins them with an `xor` for you (a fix, not a problem). Fluent
infers the same join, or you close the branch yourself with `.connectTo("e")`.

### `and` — all branches

`and` splits into parallel paths and waits for all of them where they meet. The alias is `parallel`.

```bpmnkit-text
# Parallel work
s[start Order] > fork[and Fork]
fork > pack[task Pack] > join[and Join]
fork > bill[task Invoice] > join
join > e[end Done]
```

```typescript
const defs = Bpmn.createProcess("parallel")
  .name("Parallel work")
  .startEvent("s", { name: "Order" })
  .parallelGateway("fork", { name: "Fork" })
  .branch("pack", (b) => b.task("pack", { name: "Pack" }).parallelGateway("join", { name: "Join" }))
  .branch("bill", (b) => b.task("bill", { name: "Invoice" }).connectTo("join"))
  .endEvent("e", { name: "Done" })
  .build()
```

### `or` — one or more branches

`or` takes every branch whose condition holds. It also has a default. The alias is `inclusive`.

```bpmnkit-text
# Inclusive choice
s[start Order] > pick[or What to send?]
pick >(Gift: gift = true) wrap[task Wrap] > e[end Sent]
pick >(Express: express = true) fast[task Ship express] > e
pick >(Default: default) std[task Ship standard] > e
```

```typescript
const defs = Bpmn.createProcess("or")
  .name("Inclusive choice")
  .startEvent("s", { name: "Order" })
  .inclusiveGateway("pick", { name: "What to send?" })
  .branch("Gift", (b) => b.condition("= gift = true").task("wrap", { name: "Wrap" }).endEvent("e", { name: "Sent" }))
  .branch("Express", (b) => b.condition("= express = true").task("fast", { name: "Ship express" }).connectTo("e"))
  .branch("Default", (b) => b.defaultFlow().task("std", { name: "Ship standard" }).connectTo("e"))
  .build()
```

### `eventgw` — the first event wins

An event-based gateway leads to catch events. The first one that happens takes the path.

```bpmnkit-text
# Race
s[start Quote sent] > race[eventgw Wait]
race > answer[catch:message Customer answers | msg=answer key=quoteId] > e[end Answered]
race > late[catch:timer Seven days | after=P7D] > e2[end Expired]
```

```typescript
const defs = Bpmn.createProcess("race-process")
  .name("Race")
  .startEvent("s", { name: "Quote sent" })
  .eventBasedGateway("race", { name: "Wait" })
  .branch("answer", (b) => b.intermediateCatchEvent("answer", { name: "Customer answers", messageName: "answer", correlationKey: "= quoteId" }).endEvent("e", { name: "Answered" }))
  .branch("late", (b) => b.intermediateCatchEvent("late", { name: "Seven days", timerDuration: "P7D" }).endEvent("e2", { name: "Expired" }))
  .build()
```

## Events and exceptions

An event is `start`, `end`, `catch` (waits), `throw` (sends) or `boundary` (sits on a task). Add a
trigger after a colon: `start:message`, `end:error`, `catch:timer`. The triggers are `timer`,
`message`, `signal`, `error`, `escalation`, `terminate`, `conditional`, `compensate`, `link` and
`cancel`. `event` reads as a `catch`. `link` is the one trigger you cannot use: Text has no attribute
for the link name, so the parser reports it and draws a plain event. Use `.intermediateThrowEvent(id, { linkName })` in Fluent.

### Start events

```bpmnkit-text
# Start by message
s[start:message Order arrives | msg=new-order key=orderId] > t[task Handle] > e[end Handled]
```

```typescript
const defs = Bpmn.createProcess("start-message")
  .name("Start by message")
  .startEvent("s", { name: "Order arrives", messageName: "new-order", correlationKey: "= orderId" })
  .task("t", { name: "Handle" })
  .endEvent("e", { name: "Handled" })
  .build()
```

A timer start takes `every=` (a cycle) or `at=` (a date-time):

```bpmnkit-text
# Start by timer
s[start:timer Every night | every=R/PT24H] > t[task Run report] > e[end Reported]
```

```typescript
const defs = Bpmn.createProcess("start-timer")
  .name("Start by timer")
  .startEvent("s", { name: "Every night", timerCycle: "R/PT24H" })
  .task("t", { name: "Run report" })
  .endEvent("e", { name: "Reported" })
  .build()
```

### End events

`end:error`, `end:signal` and `end:escalation` take the code or name after a bar. `end:terminate`
stops the whole process at once.

```bpmnkit-text
# End events
s[start Payment] > check[xor Paid?]
check >(Yes: paid) ok[end Done]
check >(No: default) bad[end:error Payment failed | error=PAY_FAILED]
```

```typescript
const defs = Bpmn.createProcess("end-events")
  .name("End events")
  .startEvent("s", { name: "Payment" })
  .exclusiveGateway("check", { name: "Paid?" })
  .branch("Yes", (b) => b.condition("= paid").endEvent("ok", { name: "Done" }))
  .branch("No", (b) => b.defaultFlow().endEvent("bad", { name: "Payment failed", errorCode: "PAY_FAILED" }))
  .build()
```

### Intermediate catch and throw

`catch:timer` waits (`after=` is an ISO duration). `throw:signal` and `throw:escalation` raise
something. `throw:message` is a message throw event; `catch:message` needs `msg=` and `key=`.

```bpmnkit-text
# Wait, then signal
s[start Started] > wait[catch:timer Wait an hour | after=PT1H] > ping[throw:signal Tell others | signal=wake-up] > e[end Done]
```

```typescript
const defs = Bpmn.createProcess("wait-signal")
  .name("Wait, then signal")
  .startEvent("s", { name: "Started" })
  .intermediateCatchEvent("wait", { name: "Wait an hour", timerDuration: "PT1H" })
  .intermediateThrowEvent("ping", { name: "Tell others", signalName: "wake-up" })
  .endEvent("e", { name: "Done" })
  .build()
```

### Boundary events

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

## Pools, lanes and messages

A `lane` line names who does which nodes. Every node is in one lane. A `pool` is another party,
drawn as an empty pool, and a `msg` line is a message to it or from it.

```bpmnkit-text
# Order with lanes
s[start Order placed] > check[user Check order] > ship[service Ship | job=ship] > e[end Shipped]
lane sales[Sales]: s, check
lane ops[Operations]: ship, e
```

```typescript
const defs = Bpmn.createProcess("lanes")
  .name("Order with lanes")
  .inLane("sales", { name: "Sales" })
  .startEvent("s", { name: "Order placed" })
  .userTask("check", { name: "Check order" })
  .inLane("ops", { name: "Operations" })
  .serviceTask("ship", { name: "Ship", taskType: "ship" })
  .endEvent("e", { name: "Shipped" })
  .build()
```

```bpmnkit-text
# Order with a bank
s[start Order] > pay[send Ask bank to pay | job=pay] > wait[catch:message Bank confirms | msg=paid key=orderId] > e[end Paid]
pool bank[Bank]
msg pay >(Payment) bank
msg bank >(Confirmation) wait
```

```typescript
const defs = Bpmn.createDiagram("order-bank")
  .process("order", (p) =>
    p
      .name("Order with a bank")
      .startEvent("s", { name: "Order" })
      .sendTask("pay", { name: "Ask bank to pay", taskType: "pay" })
      .intermediateCatchEvent("wait", { name: "Bank confirms", messageName: "paid", correlationKey: "= orderId" })
      .endEvent("e", { name: "Paid" }),
  )
  .process("bank", (p) => p.name("Bank"))
  .participant("order-pool", { name: "Order with a bank", processId: "order" })
  .participant("bank-pool", { name: "Bank", processId: "bank" })
  .messageFlow("payment", { source: "pay", target: "bank-pool", name: "Payment" })
  .messageFlow("confirmation", { source: "bank-pool", target: "wait", name: "Confirmation" })
  .build()
```

## Ad-hoc, AI agent, note and doc

An `adhoc` node is an ad-hoc sub-process: an AI agent that chooses among its tools. A tool is a task
with `inside=<agent id>` and no flows of its own. `doc` is the description the agent chooses a tool by.
`note` annotates a node.

```bpmnkit-text
# Agent with a tool
ask[start Question asked] > agent[adhoc Answer with tools] > done[end Answered]
users[service Look up users | job=lookup-users inside=agent]
doc users: Returns the list of sample users
note agent: Picks a tool by its description
```

```typescript
const defs = Bpmn.createProcess("agent-process")
  .name("Agent with a tool")
  .startEvent("ask", { name: "Question asked" })
  .adHocSubProcess(
    "agent",
    (sub) => sub.serviceTask("users", { name: "Look up users", taskType: "lookup-users", documentation: "Returns the list of sample users" }),
    { name: "Answer with tools" },
  )
  .annotate("agent", "Picks a tool by its description")
  .endEvent("done", { name: "Answered" })
  .build()
```

## Not in Text: Fluent only

BPMN Kit Text has no word for these. Draw them with [BPMN Kit Fluent](/docs/guides/fluent-builder),
or add them in the editor.

| Element | Fluent |
| --- | --- |
| Sub-process | `.subProcess(id, (s) => …, options?)` |
| Event sub-process | `.eventSubProcess(id, …)` |
| Transaction | `.transaction(id, …)` |
| Data object, data store | `.dataObject`, `.dataObjectReference`, `.dataStoreReference`, `.dataAssociation` |
| Complex gateway | `.complexGateway(id, options?)` |

## Cheat sheet

| Part | Words |
| --- | --- |
| Kinds | `start` `end` `task` `user` `service` `rule` `send` `receive` `script` `manual` `call` `xor` `and` `or` `eventgw` `catch` `throw` `boundary` `adhoc` |
| Aliases | `event` `parallel` `exclusive` `gateway` `inclusive` `decision` `dmn` `human` |
| Triggers | `timer` `message` `signal` `error` `escalation` `terminate` `conditional` `compensate` `link` `cancel` |
| Branch | `gw >(Label: FEEL) next` · `gw >(Label: default) next` |
| Job and data | `job=` `result=` `feel=` (last) `form=` `called=` `each=` `in.x=` `out.x=` |
| Events | `msg=` `key=` `signal=` `error=` `escalation=` `at=` `every=` `after=` `on=` `nonint` |
| Extra lines | `lane id[Name]: a, b` · `pool id[Name]` · `msg a >(Label) b` · `note id: text` · `doc id: text` |
