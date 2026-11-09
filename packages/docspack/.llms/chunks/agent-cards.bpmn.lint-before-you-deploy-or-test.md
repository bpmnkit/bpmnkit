# BPMN agent card — Lint before you deploy or test

```sh
casen check order.bpmn risk.dmn review-order.form --deploy   # one gate: BPMN + DMN + forms, and the ids that link them
casen lint lint order.bpmn --profile deploy   # BPMN only, errors only
casen deploy deploy order.bpmn                # gated first; local Reebe, --target camunda8 for a cluster
```

In code, `lintDiagram(definitions)` returns `{ diagnostics, counts }`; fail on `counts.error > 0`. Warnings (no timer boundary, no output mapping) are advice.


## Writing a process as text instead

A model writing the diagram itself can use the line format: `parseProcessText(text)` then `expand(result.diagram)` from `@bpmnkit/core`; `expand` throws the same gate message, naming what to add (`msg=`, `key=`, `every=`, …). `casen agent-card bpmn --text` prints its guide. Related cards: `casen agent-card dmn`, `casen agent-card form`.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
