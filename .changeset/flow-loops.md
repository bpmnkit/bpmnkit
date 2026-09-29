---
"@bpmnkit/flow": minor
---

`.loop(id, body, { until, max, between?, counter?, escalate? })`: repeat steps until a FEEL condition holds, at most `max` rounds, then hand over to a person. `between` steps run only when another round follows. New `Flow.runSteps` lists every handler step, loop bodies included. An `.agent()` step inside a callback now keeps its `result` variable name in the type.
