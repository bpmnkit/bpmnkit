# @bpmnkit/core — Installation — `parseProcessText(text)` and `createProcessTextStream()`

A line format for a model to write a new process in. It costs about a quarter of the output
tokens of minified compact JSON. A path is written once as `a > b > c`, a node is declared inline
the first time it is used, and the parser adds what the model would otherwise spend tokens on.
`PROCESS_TEXT_GUIDE` is the part of a system prompt that teaches the format (~600 tokens,
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
- `result=<variable>` names the variable a task's result goes to;
- `feel=<expression>` makes the step a script task that evaluates the FEEL expression into
  `result=` (its id when there is none), written as `zeebe:script`. It comes last: the
  expression takes the rest of the attributes, spaces and commas included. An expression that
  does not parse as FEEL is kept and reported in `problems`.

The guide tells the model that a step working only on process data — counting, summing,
filtering, formatting — is such a script task, never a service task:
`count[script Count open issues | result=openCount feel=count(issues[state = "open"])]`.

A boundary leads only to the handling of what it catches. When a model writes the work that
follows a task through its boundary instead (`err > count > post`), the parser moves those
ways out onto the task — all but the ones named for handling (failure, error, notify, retry,
…; the first when none is) — and drops a bare end event the task led to.

An attribute written before the `|` (`late[boundary:timer on=pay]`) is read all the same.
`after=` on an event that is not a timer makes it one, and a boundary without `on=` that one
task is drawn into (`send > wait[boundary:timer …]`) goes on that task.
Change scripts read `result=` and `feel=`, but not `each=` and `after=` yet.

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
included. A bare `lane back_office: …` or `pool tax_office` is named from its id. Ids such as
`lane_check[…]` still start paths: the keyword needs a space after it.

---
Source: https://bpmnkit.com/docs/packages/core
