# BPMN Kit Text — element reference — How to read this page

Each element has a short note, a `bpmnkit-text` block and its [BPMN Kit Fluent](/docs/guides/fluent-builder)
equivalent. The text block is rendered to a diagram when the site is built, so what you see is what
`parseProcessText` reads. A test parses every block on this page and builds every Fluent snippet.

- The line format is explained in [BPMN Kit Text — the line format](/docs/guides/process-text).
- Fluent snippets assume `import { Bpmn } from "@bpmnkit/core"` and end in `.build()`.
- A node is `id[kind Name | attributes]`. Write the bracket the first time; afterwards write only `id`.
- Text fills in what it can leave out: ids, join gateways, a missing end event. Fluent states every id.

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
