# Form agent card — Traps

- **The process calls the form id.** `userTask(id, { zeebeUserTask: true, formId: "review-order" })` and `startEvent(id, { formId })` must equal `Form.create("review-order")`, the JSON `id`, not the file name.
- **Deploy the `.form` before an instance reaches the task.** `formId` binds to the latest deployed form with that id: `casen deploy deploy review-order.form` first. With `formBindingType: "deployment"` it must be in the same deployment as the process.
- **`key` is the process variable** the field reads and writes. Keep keys equal to the variable names the process and its gateways use; a typo silently creates a new variable.
- **Use a Camunda user task** (`zeebeUserTask: true`) for a linked form; Camunda 8.10 deprecates job-worker user tasks.
- **Edit with the preserving writer.** Write `exportFormPreserving(original, edited)`; it keeps key order and component ids, so the diff shows only your change.

---
Source: https://bpmnkit.com/docs/agent-cards/form
