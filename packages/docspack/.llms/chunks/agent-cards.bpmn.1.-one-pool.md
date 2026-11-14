# BPMN agent card — 1. One pool

```text
# Expense approval | id=expense
[start Expense submitted] > [user Review expense] > [xor Approved?]
Approved? >(Yes: approved = true) [service Pay expense] > [end Expense paid]
Approved? >(No: default) [user Rework expense] > Review expense
[boundary:error Payment failed | on=payExpense error=PAY_FAILED] > [send Notify submitter] > [end Submitter notified]
```

- `# Name | id=<process id>`: the process id is the deploy key. `camunda=8.8` for an older cluster (default 8.10).
- `a > b > c` is a path. Declare a node once: `[kind Name | attrs]`; its id is the name in camelCase (`[user Review expense]` is `reviewExpense`), or write `id[kind Name]`. Later write its id or its exact name. A path that stops gets an end event.
- Kinds: `start end task user service rule send receive script manual call sub xor and or eventgw catch throw boundary adhoc`. Triggers: `<event kind>:message|timer|condition|error|signal|escalation|terminate`, e.g. `start:timer`, `boundary:error`, `end:message`.
- Decision: `gw >(Label: FEEL condition) x` per branch, exactly one `gw >(Label: default) y`. Branches that meet are joined for you; parallel work: `and` split, `and` join.
- Forms: a user task without `fields=` gets a field per variable the next decisions read (`approved = true` → checkbox, `amount > 1000` → number, `risk = "low"` → select). `fields=key[:number|checkbox|textarea|date|select(a|b)],…` sets them; `form=<id>` links your own.
- Defaults: `job=` (service, send, message end) is the id kebab-cased (`pay-expense`); `msg=` is the name kebab-cased. Other attributes: `key=<FEEL>` (every message caught after the start) · `after=PT1H`, `every=R/PT1H`, `at=2026-01-31T09:00:00Z` (a timer start takes only a literal date; `catch:timer at==<FEEL>` a variable) · `cond=<FEEL>` (last) · `error=`, `signal=`, `escalation=` · `on=<task id>`, `nonint` (boundary) · `result=<var>` · `called=<process id>` · `each=<list var>` · `in.x=`, `out.x=` · `feel=<FEEL>` (script, last) · `retries=3`, `header.k=v` · `assignee=` `groups=a;b` `users=` `due=P2D` `priority=0-100`.
- A rule task calls `decision=<id>`, default its name kebab-cased (`[rule Assess risk]` calls `assess-risk`). Pass the `.dmn` too: `casen build order.txt risk.dmn --deploy`.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
