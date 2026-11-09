# The Deploy Gate — The error

```
Not deployable on Camunda 8.10: 2 error(s)
- charge: Must have exactly one 'zeebe:taskDefinition' extension element (zeebe/service-task-definition)
- reply: Must have exactly one zeebe:subscription extension element (zeebe/message-subscription)
```

The first line names the Camunda version checked and the number of errors. Then one line per
error: the element id, Zeebe's message, and the rule. The message is the same everywhere: in an
exception, a CLI refusal, a tool result an AI model reads, and the readiness panels.


## Placeholders

`placeholders: true` fills what a placeholder can fill, on a copy, and checks again. What still
fails is refused. Each value is deterministic and does nothing useful at runtime: replace it
before you deploy. `PLACEHOLDERS` exports this table.

| Field | Value | Where |
|---|---|---|
| `jobType` | `placeholder-<elementId>` | `zeebe:taskDefinition` type of a service task, send task, script task without a script, business rule task without a decision, or message throw/end event |
| `messageName` | `placeholder-<elementId>` | a message without a name; a missing `messageRef` gets a new message |
| `correlationKey` | `="placeholder-<elementId>"` | the `zeebe:subscription` of a caught message |
| `signalName` | `placeholder-<elementId>` | a signal without a name |
| `errorCode` | `placeholder-<elementId>` | the error an error end event throws |
| `escalationCode` | `placeholder-<elementId>` | a thrown escalation |
| `timer` | `PT1H` | a timer with no duration, date or cycle |
| `calledElement` | `placeholder-<elementId>` | a call activity's called process |
| `decisionId` | `placeholder-<elementId>` | a business rule task's decision |
| `condition` | `=false` | a non-default flow leaving an exclusive or inclusive gateway (never taken) |

`placeholders` (in the result) lists every value written: `{ elementId, field, value, rule }`.

---
Source: https://bpmnkit.com/docs/guides/deploy-gate
