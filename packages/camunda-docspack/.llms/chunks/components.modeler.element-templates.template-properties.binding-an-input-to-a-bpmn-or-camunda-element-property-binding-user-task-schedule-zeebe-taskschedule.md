# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — User task schedule: `zeebe:taskSchedule`

| **Binding `type`**         | `zeebe:taskSchedule`                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown`                                               |
| **Binding parameters**     | `property`: The name of the property.Supported properties: `dueDate` and `followUpDate`. |
| **Mapping result**         | `<zeebe:taskSchedule [property]="[userInput]" />`                                             |

The `zeebe:taskSchedule` binding allows you to configure the [user task scheduling](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks#scheduling).

```json
[
  {
    ...,
    "value": "=dueDateVariable",
    "binding": {
      "type": "zeebe:taskSchedule",
      "property": "dueDate"
    }
  },
  {
    ...,
    "value": "2025-10-14T12:00:00Z",
    "binding": {
      "type": "zeebe:taskSchedule",
      "property": "followUpDate"
    }
  },
  ...
]
```

**Note**
When `zeebe:taskSchedule` is used, `zeebe:userTask` must be set on the same element.  
If the template sets a static `value` for `dueDate` or `followUpDate`, it must be defined as an ISO 8601 combined date and time representation.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
