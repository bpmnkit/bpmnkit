---
"@bpmnkit/engine": minor
---

Gateway and join semantics match Camunda 8 (#334–#337). Inclusive and complex gateways fail when no condition is true and there is no default flow. A gateway or multi-instance completion condition that is not a boolean fails the instance (`lenientConditions` restores the old reading as false; `dryRun` uses it). A parallel join still waiting for tokens keeps the instance `active`, listed in the new `waitingJoins`. Missing `incoming`/`outgoing` are derived from the sequence flows.
