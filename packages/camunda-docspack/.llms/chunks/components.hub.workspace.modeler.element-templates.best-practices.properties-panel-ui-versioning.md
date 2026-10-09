# Best practices for custom-built element templates — Properties panel UI — Versioning

If you plan to make changes to your template over time and want to support [template evolution](https://github.com/bpmn-io/element-templates/blob/main/docs/LIFE_CYCLE.md#overview), include a version number property in your template, starting from 1. Templates with the same ID and different version values offer an upgrade path.

```json
{
  "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
  "name": "My Connector",
  "id": "org.my.connector",
  "version": 1
}
```

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/best-practices
