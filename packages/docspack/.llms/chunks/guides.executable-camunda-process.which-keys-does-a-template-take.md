# Build an Executable Camunda Process — Which keys does a template take?

The keys are the template's property ids, for example `url`, `method`, `retryCount` or
`authentication.type`, not the labels shown in the Modeler. List them from the command line:

```sh
casen connector show io.camunda.connectors.HttpJson.v2
```

Properties you omit keep their template default; you do not have to repeat them. If you
mistype a key, `applyTemplates` reports it in `problems` with the key it thinks you meant. The
output lists every property with its id, type and default, so copy the id from there, and set
only the ones whose default is wrong for your process. Nested properties use dotted ids such
as `authentication.type`, and the dot is part of the key, not a path into an object.

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
