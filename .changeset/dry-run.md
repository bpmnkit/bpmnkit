---
"@bpmnkit/engine": minor
"@bpmnkit/core": minor
"@bpmnkit/cli": minor
"@bpmnkit/drop": minor
"@bpmnkit/studio": minor
---

Prove a generated process runs, and list the secrets it needs.

- **`@bpmnkit/engine/testing`**: `dryRun(definitions, { processId, variables, response })` runs a process once from start to end with every connector and job mocked. It delivers the messages it waits for and moves the clock for timers. It reports `reachedEnd`, the path, the connectors passed, and where and why it stopped.
- **`@bpmnkit/core`**: `listSecrets(definitions)` lists every `{{secrets.X}}` / `camunda.secrets.X` a diagram reads, with the elements that read it.
- **`@bpmnkit/cli`**: `casen synth --check` dry-runs the compiled processes and lists their secrets. A process that cannot reach its end fails the command.
- **`@bpmnkit/drop`**: drafts with connectors show their secrets and a dry-run result. `bench:generate --connect` dry-runs each connected diagram.
- **`@bpmnkit/studio`**: **Try it** runs a model on the local engine, sending only GET requests for real and simulating everything else.
