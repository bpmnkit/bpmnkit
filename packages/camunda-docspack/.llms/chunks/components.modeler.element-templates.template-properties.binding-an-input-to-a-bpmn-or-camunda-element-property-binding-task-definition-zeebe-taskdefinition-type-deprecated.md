# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Task definition: `zeebe:taskDefinition:type` (deprecated)

**Danger**
`zeebe:taskDefinition:type` is a deprecated binding. Instead, use `zeebe:taskDefinition` with `property=type`.

| **Binding `type`**         | `zeebe:taskDefinition:type`                         |
| -------------------------- | --------------------------------------------------- |
| **Valid property `type`s** | `String` `Text``Hidden``Dropdown` |
| **Binding parameters**     |                                                     |
| **Mapping result**         | `<zeebe:taskDefinition type="[userInput]" />`       |

Configures the [task type](https://docs.camunda.io/docs/next/components/modeler/bpmn/service-tasks#task-definition) for a service or user task.

```json
{
  ...,
  "value": "aTaskType",
  "binding": {
    "type": "zeebe:taskDefinition:type"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
