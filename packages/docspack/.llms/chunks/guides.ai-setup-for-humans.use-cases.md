# AI setup — for humans — Use cases

### Generate a process inside a bigger agent flow (recommended)

Ask Claude Code for the whole job — "build an expense approval process and deploy it, then
write a worker for the `check-budget` job". The agent does the BPMN step like this:

1. Reads the card once: `casen agent-card bpmn` (add `--text` for the full line format).
2. Writes a spec file with its Write tool, for example `expense.txt`:

   ```text
   # Expense approval | id=expense
   [start Expense submitted] > [service Check budget | job=check-budget] > [xor Within budget?]
   Within budget? >(Yes: within = true) [end Paid]
   Within budget? >(No: default) [user Review expense | fields=amount:number,reason] > Paid
   ```

3. Runs `casen build expense.txt --deploy` once.
4. Reads the output. One line starting with `✓` means built, lint clean and deployed (it
   also names the forms it wrote). Any `✖` line is a problem to fix in the spec, then run
   again. On `✓` the agent continues with the next step of its flow (the worker, tests, a summary).

The one-line output is the proof — the agent does not need to open the XML or render an image.

### Edit an existing diagram, keeping its layout

Ask: "add a fraud check after *Request payment* in `order.bpmn`". The agent writes a module and
runs `casen build edit.mjs --edit order.bpmn`; shapes keep their place, only new tasks get forms.

```js
export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "order")
		.insertAfter("ask")
		.serviceTask("fraud", { name: "Check fraud", taskType: "check-fraud" })
```

### Generate forms for user tasks

Every user task without a form gets one by default (fields from `fields=` or from the variables
the next conditions read). Write your own with `casen agent-card form`, put the `.form` next to
the spec, and it is deployed as it is. `--no-forms` turns generation off.

### Retarget the Camunda version

`casen build edit.mjs --edit order.bpmn --camunda 8.10` sets the file's
`executionPlatformVersion`. For a text spec, `--camunda 8.10` overrides a `camunda=` in the spec.

---
Source: https://bpmnkit.com/docs/guides/ai-setup-for-humans
