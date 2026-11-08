---
"@bpmnkit/core": minor
---

`validateDeployable(definitions, options)` and `validateDeployableXml(xml, options)` report what Camunda 8 (Zeebe) rejects at deploy time, from `spec/zeebe-rules.json`: recursive into every sub-process, version-aware (`camundaVersion`, default the newest supported), independent of `modeler:executionPlatform`, with an optional `resolver` for the other resources of a deployment. Findings are `zeebe/<rule>` in the `deploy` category; `isDeployable(findings)` is the gate. Lint now shows them with the other engine rules. `compat/no-expression` flags an expression error or escalation code on a catch event on every version (Zeebe 8.9 still rejects it). The parser keeps `extensionElements` on a `messageEventDefinition` (`zeebe:publishMessage`). `compilePlan` gives each sub-process a start event.
