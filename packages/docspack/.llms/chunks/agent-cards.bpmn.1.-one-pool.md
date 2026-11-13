# BPMN agent card — 1. One pool

```text
# Expense approval | id=expense
start[start Expense submitted] > review[user Review expense | fields=amount:number,approved:checkbox] > ok[xor Approved?]
ok >(Yes: approved = true) pay[service Pay expense | job=pay-expense] > paid[end Expense paid]
ok >(No: default) rework[user Rework expense] > review
failed[boundary:error Payment failed | on=pay error=PAY_FAILED] > notify[send Notify submitter | job=notify] > notified[end Payment failed]
```

- `# Name | id=<process id>`: the process id is the deploy key. Add `camunda=8.8` for an older cluster (default 8.10).
- `a > b > c` is a path. Declare a node the first time: `id[kind Name | attrs]`; later write only `id`.
- Kinds: `start end task user service rule send receive script manual call xor and or eventgw catch throw boundary adhoc`. Triggers: `start:message`, `start:timer`, `catch:timer`, `boundary:timer`, `boundary:error`, `end:error`, `end:message`, `end:terminate`, `signal`, `escalation`.
- Decision: `gw >(Label: FEEL condition) x` per branch, exactly one `gw >(Label: default) y`. Branches that meet are joined for you; parallel work: `and` split, `and` join.
- Attributes: `job=` job type (service, send, message end; default: the id) · `form=<form id>` (default: generated `<process id>-<task id>`) · `fields=key[:number|checkbox|textarea|date|select(a|b)],…` for the generated form · `msg=` + `key=<FEEL>` (every message caught after the start) · `after=PT1H`, `every=R/PT1H`, `at=<date>` (timers) · `error=`, `signal=`, `escalation=` · `on=<task>` and `nonint` (boundary) · `result=<var>` · `called=<process id>` · `each=<list var>` (once per item) · `in.x=<FEEL>`, `out.x=<FEEL>` · `feel=<FEEL>` (script, last).
- A rule task's id is its DMN decision id: pass the `.dmn` too, `npx casen build order.txt risk.dmn --deploy`.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
