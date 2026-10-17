# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Header: `zeebe:taskHeader`

| **Binding `type`**         | `zeebe:taskHeader`                                  |
| -------------------------- | --------------------------------------------------- |
| **Valid property `type`s** | `String` `Text``Hidden``Dropdown` |
| **Binding parameters**     | `key`: The key of the task header                   |
| **Mapping result**         | `<zeebe:header key="[key]" value="[userInput]" />`  |

Configures a [task header](https://docs.camunda.io/docs/next/components/modeler/bpmn/service-tasks#task-headers).

```json
{
  ...,
  "value": "aHeaderValue",
  "binding": {
    "type": "zeebe:taskHeader",
    "key": "aHeaderKey"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
