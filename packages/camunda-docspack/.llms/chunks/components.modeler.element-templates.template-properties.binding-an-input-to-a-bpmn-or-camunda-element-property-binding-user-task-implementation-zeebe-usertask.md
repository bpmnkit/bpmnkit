# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — User task implementation: `zeebe:userTask`

| **Binding `type`**         | `zeebe:userTask`                                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `Hidden`                                                                                                              |
| **Binding parameters**     | This is a flag-like binding, so it has no parameters and only applies to templates with element type `bpmn:UserTask`. |
| **Mapping result**         | `<zeebe:userTask />`                                                                                                  |

The `zeebe:userTask` binding allows you to configure the implementation type for a templated `bpmn:UserTask`. When present, it sets the task as a Camunda user task; when omitted, the task defaults to a job worker.

```json
{
  "type": "Hidden",
  "binding": {
    "type": "zeebe:userTask"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
