# Form agent card — Validate

The script re-parses the file and checks the form id. Before deploying, run `casen check review-order.form order.bpmn --deploy`: it lints the form and checks that every `formId` in the `.bpmn` names a form. Check by hand that each `key` is a variable the process expects.

Related cards: `casen agent-card bpmn`, `casen agent-card dmn`. More: `npx bpmnkit-docs ask "form on a start event"`.

---
Source: https://bpmnkit.com/docs/agent-cards/form
