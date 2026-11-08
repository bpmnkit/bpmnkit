# Build an Executable Camunda Process — Which keys does a template take?

The keys are the template's property ids, for example `url`, `method`, `retryCount` or
`authentication.type`, not the labels shown in the Modeler. List them from the command line:

```sh
casen connector show io.camunda.connectors.HttpJson.v2
```

Properties you omit keep their template default; you do not have to repeat them. If you
mistype a key, `applyTemplates` reports it in `problems` with the key it thinks you meant.
`casen connector show` prints the template's name and task type, then its required inputs and its optional
inputs, one per line as `key — label`. Copy the `key` from there: it is the same id
`applyTemplates` accepts, for example `retryCount`. Add `--filter timeout` to keep the properties
whose key or label contains that text, and `--condensed` for one line each with type, default,
`required` and the condition that switches it on (`key  type  default  required  when method in POST|PUT`).
Set only the keys whose template default is wrong for your process. Nested properties use dotted ids such
as `authentication.type`, and the dot is part of the key, not a path into an object.

To configure a task in a `.bpmn` file from the command line, `casen connector apply order.bpmn Call http --values call.json`
takes the same keys. Put multi-line or quoted FEEL in the JSON file rather than in a shell `--set`.

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
