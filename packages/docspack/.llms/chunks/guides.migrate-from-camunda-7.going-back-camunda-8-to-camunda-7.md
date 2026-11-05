# Migrate from Camunda 7 — Going back: Camunda 8 to Camunda 7

Camunda 8 stays the focus, but you can export a model for Camunda 7 or Operaton, best effort:

```sh
casen migrate c7 order.bpmn --to camunda7   # writes order.c7.bpmn
```

In code, `convertCamunda8To7(Bpmn.parse(xml))` returns `{ definitions, findings }`. It maps job types to
`camunda:type="external"` with `camunda:topic`, I/O mappings to `camunda:inputOutput`, assignment,
form keys, call activities (`camunda:in` / `camunda:out`) and version tags. It removes every `zeebe:` and
`modeler:` element, attribute and namespace.

It does not translate FEEL to JUEL: such expressions are kept as written and reported as `manual`
findings. Message correlation keys, connectors and Zeebe-only features (task headers, listeners and
similar) are dropped and reported.

---
Source: https://bpmnkit.com/docs/guides/migrate-from-camunda-7
