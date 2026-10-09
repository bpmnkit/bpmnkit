# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Task definition: `zeebe:taskDefinition`

| **Binding `type`**         | `zeebe:taskDefinition`                                                            |
| -------------------------- | --------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String` `Text``Hidden``Dropdown`                               |
| **Binding parameters**     | `property`: The name of the task definition property. Can be `type` or `retries`. |
| **Mapping result**         | `<zeebe:taskDefinition [property]="[userInput]" />`                               |

Configures the [task](https://docs.camunda.io/docs/next/components/modeler/bpmn/service-tasks#task-definition) for a service or user task.

```json
[
  {
    ...,
    "value": "aTaskType",
    "binding": {
      "type": "zeebe:taskDefinition",
      "property": "type"
    }
  },
  {
    ...,
    "value": "3",
    "binding": {
      "type": "zeebe:taskDefinition",
      "property": "retries"
    }
  },
  ...
]
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
