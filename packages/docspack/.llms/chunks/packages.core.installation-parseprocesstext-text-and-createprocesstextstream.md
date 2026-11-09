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
- `at=<date-time>` sets a timer's date (`at=2026-12-01T09:00:00Z`), and `every=<cycle>` its cycle:
  an ISO 8601 repeating interval (`every=R3/PT10M`) or a duration repeated forever
  (`every=1h` → `R/PT1H`);
- `msg=<name>` names the message a message event or receive task waits for or sends, and
  `key=<FEEL>` the correlation key it is caught on (`key=orderId` → `=orderId`). Camunda 8 needs a
  key wherever a message is waited for, except at a process start;
- `signal=<name>`, `error=<code>` and `escalation=<code>` name the signal, error or escalation;
- `called=<process id>` sets the process a call activity runs. `job=` on a call activity means
  the same;
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
`msg=`, `signal=`, `error=`, `escalation=`, `at=` and `every=` on an event written without a
trigger make it that kind of event (`paid[catch Paid | msg=paid key=orderId]`); on an event of
another kind they are reported and ignored.
Change scripts read `result=`, `feel=`, `at=`, `every=`, `called=`, `msg=`, `key=`, `signal=`,
`error=` and `escalation=`, but not `each=` yet.

---
Source: https://bpmnkit.com/docs/packages/core
