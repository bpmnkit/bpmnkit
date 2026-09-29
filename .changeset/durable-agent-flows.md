---
"@bpmnkit/flow": minor
"@bpmnkit/cli": minor
"@bpmnkit/worker-client": minor
---

New `@bpmnkit/flow`: write a durable workflow as typed TypeScript steps (`.run()`, `.agent()`, `.waitFor()`, `.approve()`) and get the BPMN, the job types, the message correlation and the worker from the one definition. New `casen agent hire|list|fire|work`: hire coding-agent CLIs by role and rank and run them as a workforce serving the flows' `agent:<role>` jobs. `@bpmnkit/worker-client`'s `poll()` takes an `AbortSignal` to stop it.
