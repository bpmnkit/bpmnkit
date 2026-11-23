# BPMN Kit Text — the line format — Where it is used

- **Drop AI generate** (`apps/drop`): the generate prompt is built from `PROCESS_TEXT_GUIDE`, and
  the reply streams into the canvas.
- **CLI `bpmnkit build`** (`apps/cli`): its text spec is the guide plus pool sections, each read by
  `parseProcessText`. See [build](/docs/cli/build).
- **Editor process delta** (`packages/editor`): `writeProcessText` shows a model the open diagram;
  it answers with a change script.


## Text vs Fluent

Use **BPMN Kit Text** when a language model writes the process, or when you want it to stream.
Use [BPMN Kit Fluent](/docs/guides/fluent-builder) when you write the model in TypeScript and
want types and refactoring. Both end in the same model.

---
Source: https://bpmnkit.com/docs/guides/process-text
