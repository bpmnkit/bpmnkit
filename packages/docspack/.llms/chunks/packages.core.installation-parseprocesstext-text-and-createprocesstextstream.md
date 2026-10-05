# @bpmnkit/core — Installation — `parseProcessText(text)` and `createProcessTextStream()`

A line format for a model to write a new process in. It costs about a quarter of the output
tokens of minified compact JSON. A path is written once as `a > b > c`, a node is declared inline
the first time it is used, and the parser adds what the model would otherwise spend tokens on.
`PROCESS_TEXT_GUIDE` is the part of a system prompt that teaches the format (~350 tokens,
example included).

```text
# Expense approval
start[start Expense submitted] > check[xor Amount over 1000?]
check >(Yes: amount > 1000) review[user Review expense] > pay[service Pay expense] > done[end Expense paid]
check >(No: default) auto[service Approve automatically] > pay
failed[boundary:error Payment failed | on=pay] > notify[send Notify submitter] > notice[end Payment failed]
```

Parallel work, deadlines and steps run per item are taught as rules, not in the example:
`glm-4.7-flash` copied example lines such as "Email each approver" into processes that never
asked for them.

Attributes after `|`:
- `on=<task>` puts a boundary event on its task, and `nonint` makes it non-interrupting;
- `job=<type>` sets the job type;
- `each=<list>` runs a task or sub-process once per item of the list variable, each instance
  getting its item in the singular (`each=approvers` → `approver`);
- `after=<duration>` sets a timer's duration, ISO 8601 or `5m`, `2 hours`, `1 day`. Without
  it, a duration in the timer's name is read ("Wait 5 minutes" → `PT5M`).

An attribute written before the `|` (`late[boundary:timer on=pay]`) is read all the same.
`after=` on an event that is not a timer makes it one, and a boundary without `on=` that one
task is drawn into (`send > wait[boundary:timer …]`) goes on that task.
Change scripts do not read `each=` and `after=` yet.

```typescript
import { expand, Bpmn, parseProcessText, PROCESS_TEXT_GUIDE } from "@bpmnkit/core";

const { diagram, problems, fixes } = parseProcessText(modelOutput);
const xml = Bpmn.export(expand(diagram));
```

`parseProcessText` never throws, and its diagram always expands. It also keeps the structural
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
- a catch or boundary event written without a trigger becomes a message event, so it deploys.
  A catch event named for a call it makes ("Send to SQS") becomes a service task instead
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
  decision id

---
Source: https://bpmnkit.com/docs/packages/core
