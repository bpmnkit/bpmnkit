# DMN agent card — Top builder options

- `Dmn.createDecisionTable(decisionId)` … `.build()` returns `DmnDefinitions`; `Dmn.export(defs)` gives the XML with DMNDI shapes.
- `.name(text)` is the display name; `.hitPolicy("UNIQUE" | "FIRST" | "ANY" | "COLLECT" | "RULE ORDER" | "OUTPUT ORDER" | "PRIORITY")`.
- `.input({ label, expression, typeRef })`: `expression` is a FEEL expression over process variables (`amount`, `order.total`).
- `.output({ label, name, typeRef })`: `name` is the key in the result.
- `.rule({ inputs, outputs, description })`: one entry per column, in column order, or `build` throws.
- `typeRef`: `"string" | "number" | "boolean" | "date"`.
- Read or change an existing file: `Dmn.parse(xml)` → `defs.decisions[i].decisionTable`.

---
Source: https://bpmnkit.com/docs/agent-cards/dmn
