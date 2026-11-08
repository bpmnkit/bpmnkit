---
"@bpmnkit/core": patch
---

Camunda Form parse and export are lossless: `exportForm` keeps `valuesExpression` on radio and checklist, and `validate` (now with `min`, `max`, `pattern`, `validationType`), `values` items and `layout` keep keys the model does not know in `extraProps`. `validate` of datetime and taglist is parsed into the model. An unknown component with `layout: null` or a raw `extraProps` key round-trips, and a `null` table column throws a `ParseError`.
