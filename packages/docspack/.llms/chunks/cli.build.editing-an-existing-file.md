# casen build — Editing an existing file

`--edit order.bpmn` passes the parsed file to a module spec and writes the result over it.
Existing shapes keep their place; shapes right of an insertion move right to make room
(`makeRoom`), new elements are drawn next to what they connect to (`placeNewShapes`), and the
file's formatting is kept (`exportPreserving`).

```js
export default (kit, model) =>
	kit.Bpmn.continueProcess(model, "order")
		.insertAfter("ask")
		.serviceTask("fraud", { name: "Check fraud", taskType: "check-fraud" })
```


## Findings

Each finding names the element, the BPMN Kit rule id and the key the rule has in
`.bpmnlintrc` (what c8ctl and Camunda Modeler lint print):

```
✖ order.bpmn review: User task "Review" has no form. [compat/user-task-definition, .bpmnlintrc "camunda-compat/user-task-definition"]
```

---
Source: https://bpmnkit.com/docs/cli/build
