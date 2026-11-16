# @bpmnkit/core — Installation — `parseProcessText(text)` and `createProcessTextStream()` (2)

```text
s[start:timer Every hour | every=1h] > h[call Handle order | called=handle-order]
h > w[catch Paid | msg=payment-received key=orderId] > n[throw:message Notify | msg=order-done job=notify] > e[end]
failed[boundary:error Failed | on=h error=PAYMENT_FAILED] > f[end:error Give up | error=GIVEN_UP]
```

**Lanes and pools.** Three line kinds, written after the paths:

```text
lane sales[Sales team]: start, review, ok    the lane a role works in; one line per role
pool bank[Bank]                              another party, drawn as an empty pool
msg pay >(Payment) bank                      a message to that party; msg bank > paid one from it
```

The parser writes them as the compact `lanes`, `participants` and `messageFlows`, and `expand`
draws the process in its own pool with its lanes. A node no lane lists — a join or end event the
parser added, a boundary event, a node the model forgot — goes into its predecessor's lane (a
boundary into its host's), else its successor's, else the first lane, and is listed in `fixes`.
A node listed in two lanes stays in the later one; a member that is not a top-level node is left
out. A message has one end in the process and the other on a `pool` line: a message between two
pools, between two nodes of the process, out of a start or catch event, into an end or throw
event, or touching a gateway is left out with a problem. Its label is kept as written, colons
included. A lane without a bracket, `lane back_office: …`, is named from its id; `lane back_office[]: …`
has no name. A pool needs its bracket (`pool tax_office[Tax office]`, or `pool tax_office[]` for no
name), so two words of prose such as "pool party" stay prose. The writer writes an unnamed lane or
pool with `[]`, so it reads back unnamed. Ids such as `lane_check[…]` still start paths: the keyword
needs a space after it.

```typescript
import { expand, Bpmn, parseProcessText, PROCESS_TEXT_GUIDE } from "@bpmnkit/core";

const { diagram, problems, fixes } = parseProcessText(modelOutput);
const xml = Bpmn.export(expand(diagram));
```

`parseProcessText` never throws, and its diagram is always valid BPMN: `expand(diagram, {
validate: false })` never throws. Whether it deploys is `expand`'s question: the gate runs there,
and a caller that reports `problems` reports a `DeployabilityError` the same way. The parser
cannot invent what only the writer knows, a correlation key or a timer's time, so text without
them is refused at `expand` with the reason. It also keeps the structural
rules `lintDiagram` checks — including bpmnlint's recommended set — whatever the model wrote.
Text it cannot use, and anything it has to leave out, is returned in `problems` with its line
number. What it adds or changes is listed in `fixes`:

- flow ids are generated
- a line that ends in an arrow continues on the next line, a note after a line's last node
  (`(ADDED)`) is ignored, and a second `|` in the attributes is a separator
- an id used in a flow but never declared becomes a task named from it, or the gateway its
  name is a kind of (`pick > and`)
- an id declared again after an arrow, with a different kind or name, is a new node (`done_2`),
  and later bare references mean the newest; restated at the start of a line, it is the node
  already there. A name of three words or more makes a new node even when its kind word is
  unknown (`send[post Slack message to #support]`)
- a number written as an id (`1[service …]`) becomes `n1`; a numbered list (`1. a > b`) is
  still prose
- after an arrow, a kind and a name without brackets (`… > end Order shipped`) declare a node;
  at the start of a line they stay prose
- a line that starts with an arrow continues the last node of the path above it, and a space
  between an arrow and its label (`gw > (No: default) b`) is allowed
- a step whose name says it is done for each or every item ("Send email to each stakeholder") runs
  once per item of the list (`=stakeholders`); "every day" and other time words do not count
- a DMN decision whose outcomes are not labelled splits with an exclusive gateway, not in parallel
- steps in a row between an and split and an and join (`fork[and] > a > b > joined[and]`) run in
  parallel; a catch event with `on=` a task is a boundary event; a named and node with `each=` is
  a task run per item
- a bracket left open is closed where the name plainly ends: at a `)` before the next arrow,
  before the next arrow, or at the end of the line (`start[start Order) > …`)
- a missing start event is added, and a start event left unconnected leads to the first path;
  only the first blank start event is kept
- a branch drawn into a boundary event continues to what the boundary leads to, and a flow from a
  node to itself is refused
- **every node lies on a path from a start event.** A task or gateway nothing leads to continues
  the latest path written before it that stops short of an end event — most often the model left
  out one arrow. What still cannot be reached, such as a boundary on a task that was never
  declared, is left out and reported; it is never drawn as a loose node
- an end event is added after every path that stops elsewhere, and a loop with no way out gets
  an exit branch from its decision; a loop with no decision loses the flows that close it
- a link event in a path becomes a plain event, since the format cannot name its partner
- a catch or boundary event written without a trigger becomes a message event (it still needs
  `key=` to deploy). A catch event named for a call it makes ("Send to SQS") becomes a service
  task instead
- an id written with spaces before its bracket (`call back[service …]`) is read as one id,
  `call_back`
- a gateway with one way in and one way out — a question answered only one way — is removed;
  an event-based gateway waiting for one event becomes a catch event
- a task or event with several ways out gets a split gateway: exclusive when the branches are
  labelled, event-based when they all wait (at least one on a catch event, and receive tasks
  among them become message catch events), and parallel otherwise
- branches that meet at a task, an event or a gateway that also splits are joined first, by a
  gateway of the type they were split with: parallel branches get a parallel join
- a condition that is not FEEL (`applicant is eligible`) moves into the branch label and is
  reported, so it cannot fail at deploy time
- every xor/or split has one default — the branch labelled `No`, `Otherwise`, `Rejected` and the
  like, or else the last unconditioned one — and every other branch a FEEL condition. A branch
  written in prose gets one on a variable named for the gateway's question:
  `Status approved?` with `Yes` becomes `= statusApproved = true`
- flows out of anything but a decision carry no condition or label
- an unnamed event, task or decision is named from its id
- a service or send task without `job=` takes its id as job type, and a rule task its id as
  decision id. Likewise, the id stands in for a missing `msg=` on a message event or receive task,
  `job=` on a message throw or end event, `signal=` on a signal event, `error=` or `escalation=`
  on an error or escalation throw or end event, and `called=` on a call activity. A correlation key
  and a timer's time have no stand-in

---
Source: https://bpmnkit.com/docs/packages/core
