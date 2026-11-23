# BPMN Kit Text — the line format — Syntax cheat sheet

One path per line. The first line is `# Process name` (add ` | camunda=8.10` to target a Camunda
version).

```text
a > b > c                  sequence flow
id[kind Name]              declare a node the first time; afterwards write only id
gw >(Label: condition) x   conditional branch, condition in FEEL
gw >(Label: default) y     branch taken when no condition holds
```

| Part | Words |
| --- | --- |
| Kinds | `start` `end` `task` `user` `service` `rule` `send` `receive` `script` `manual` `call` `xor` `and` `or` `eventgw` `catch` `throw` `boundary` `adhoc` |
| Triggers (events) | `timer` `message` `signal` `error` `escalation` `terminate` `conditional` `compensate` `cancel`, written `start:message`, `boundary:error` |
| Attributes after `\|` | `on=<task id>` (required on a boundary), `nonint`, `job=`, `each=<list>`, `after=<ISO duration>`, `result=`, `feel=<expr>` (last) |
| Names after `\|` | `msg=` + `key=<FEEL>`, `signal=`, `error=`, `escalation=`, `at=` / `every=` (timers), `called=` (call) |
| Forms and mappings | `form=<form id>`, `in.<name>=<FEEL>`, `out.<name>=<FEEL>` |

Further lines, after the paths:

```text
lane sales[Sales team]: a, b       a and b are done by the Sales team
pool bank[Bank]                    another party, drawn as an empty pool
msg pay >(Payment) bank            a message to it; msg bank > paid is one from it
note review: Over 1000 needs a person
doc review: Documentation of the element
tool[service Look up | inside=agent]   a tool of an ad-hoc agent (adhoc kind)
```

A boundary starts its own line, `on=` a task, and leads only to the handling. Branches that meet
again are joined automatically; join parallel branches with an `and` node.

Every kind, trigger and attribute has a rendered example in the [element reference](/docs/guides/process-text-reference).

---
Source: https://bpmnkit.com/docs/guides/process-text
