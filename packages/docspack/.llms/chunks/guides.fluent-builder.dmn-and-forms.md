# BPMN Kit Fluent — the fluent builder — DMN and forms

DMN and forms are not fluent chains: use `Dmn.parse` / `Dmn.export` / `Dmn.drd()` and
`Form.parse` / `Form.export`. See [packages/core](/docs/packages/core).


## Fluent vs process text

Use the fluent builder when you write the model in TypeScript and want types and refactoring.
Use [BPMN Kit Text](/docs/guides/process-text) (`parseProcessText`) when a language model writes
the process: it is a compact line format that costs about a quarter of the output tokens, and both
end in the same model.


## Next

[Building Processes](/docs/guides/building-processes) · [Gateways & Branching](/docs/guides/gateways) · [`@bpmnkit/core`](/docs/packages/core)

---
Source: https://bpmnkit.com/docs/guides/fluent-builder
