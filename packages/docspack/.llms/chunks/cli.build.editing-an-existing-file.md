# casen build — Editing an existing file

`--edit order.bpmn` passes the parsed file to a module spec and writes the result over it.
Existing shapes keep their place; shapes right of an insertion move right only as far as the
new steps need beyond the room already free (`makeRoom`), new elements are drawn next to what
they connect to (`placeNewShapes`), and the file's formatting is kept (`exportPreserving`).
Only the user tasks the edit adds get forms; existing tasks and their form links stay as they
are. `--camunda 8.10` sets the file's `executionPlatformVersion`.

```js
export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "order")
		.insertAfter("ask")
		.serviceTask("fraud", { name: "Check fraud", taskType: "check-fraud" })
```

---
Source: https://bpmnkit.com/docs/cli/build
