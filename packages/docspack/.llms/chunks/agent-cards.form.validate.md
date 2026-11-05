# Form agent card — Validate

The script re-parses the file and checks the form id. Before deploying, check that every `formId` in your `.bpmn` files names a `.form` file's `id`, and that each `key` is a variable the process expects. A dedicated form lint may ship in your `casen` version: see `casen --help`.

Related cards: `casen agent-card bpmn`, `casen agent-card dmn`. More: `npx bpmnkit-docs ask "form on a start event"`.

---
Source: https://bpmnkit.com/docs/agent-cards/form
