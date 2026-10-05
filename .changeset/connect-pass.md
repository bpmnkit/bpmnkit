---
"@bpmnkit/core": minor
"@bpmnkit/connectors": minor
"@bpmnkit/drop": minor
---

The connect pass: generated and shared diagrams get their Camunda connectors configured.

- **`@bpmnkit/core/connectors`** (re-exported by `@bpmnkit/connectors`): `selectConnectors({ text, tasks })` picks the connector cards for each task of a diagram, in code. A card qualifies when the task's name names the system, when the request names it and no other task does, or when the task's name shares a word with the connector's name. REST is the fallback for HTTP-call tasks. A task with no candidate is left out. `formatConnectorSelection` writes the picked cards as a prompt block. `applyConnectorLines` now changes only the inputs a line names when the element already carries the same connector.
- **`@bpmnkit/drop`**: `POST /drop/api/connect`, on when `AI_CONNECT_MODEL` is set.
  - It picks the cards, asks the model for `with` lines only, and applies them on the server; with nothing to connect it is skipped without a model call.
  - The "Describe a process" generator runs it after every draft and change. Required inputs it left out become questions answered with one line, applied without a model.
  - Shared diagrams get **Add connectors** while editing, as one undoable change.
  - The first-draft prompt asks for one service task per outside system.
  - `bench:generate --connect` scores the connected diagrams. Ten connector golden prompts are added, and a crash at the end of golden-prompt runs is fixed.
