# Recipes: Element Templates and Connectors — How do I find a connector template's property ids?

Use the `casen` CLI. `connector show` with `--condensed` prints one line per non-hidden property: the id you
pass as a value, its type, default, whether it is required and the condition that switches it on.
`--filter` keeps the properties whose key or label contains the text.

```sh
casen connector show io.camunda.connectors.HttpJson.v2 --condensed --filter retry
casen connector search slack
```

The same ids apply to the file-based command, which edits a `.bpmn` in place:

```sh
casen connector apply order.bpmn call-api http --set url=https://example.com --set retryCount=5
```

In code, `propertyKey(prop)` from `@bpmnkit/core/connectors` returns the same id for each entry
of `getTemplate(id)?.properties`.

---
Source: https://bpmnkit.com/docs/guides/recipes-element-templates
