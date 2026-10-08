# @bpmnkit/flow

## 0.2.1

### Patch Changes

- 4d8207c: The repository moved to github.com/bpmnkit/bpmnkit. Republished so each package's `repository`, `bugs` and `homepage` metadata and its npm provenance point at the new repository.
- Updated dependencies [4d8207c]
  - @bpmnkit/core@1.4.1
  - @bpmnkit/worker-client@0.2.1

## 0.2.0

### Minor Changes

- 862aa57: New `@bpmnkit/flow`: write a durable workflow as typed TypeScript steps (`.run()`, `.agent()`, `.waitFor()`, `.approve()`) and get the BPMN, the job types, the message correlation and the worker from the one definition. New `casen agent hire|list|fire|work`: hire coding-agent CLIs by role and rank and run them as a workforce serving the flows' `agent:<role>` jobs. `@bpmnkit/worker-client`'s `poll()` takes an `AbortSignal` to stop it.
- 862aa57: `.loop(id, body, { until, max, between?, counter?, escalate? })`: repeat steps until a FEEL condition holds, at most `max` rounds, then hand over to a person. `between` steps run only when another round follows. New `Flow.runSteps` lists every handler step, loop bodies included. An `.agent()` step inside a callback now keeps its `result` variable name in the type.

### Patch Changes

- Updated dependencies [0afd35e]
- Updated dependencies [862aa57]
- Updated dependencies [48e48de]
- Updated dependencies [78ccbf9]
- Updated dependencies [48e48de]
- Updated dependencies [48e48de]
- Updated dependencies [48e48de]
- Updated dependencies [502cc73]
  - @bpmnkit/core@1.2.0
  - @bpmnkit/worker-client@0.2.0
