# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — User task priority: `zeebe:priorityDefinition`

| **Binding `type`**         | `zeebe:priorityDefinition`                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `Number``String` (only with `feel` set to `required`)`Text` (only with `feel` set to `required`)`Hidden``Dropdown` |
| **Binding parameters**     | `property`: The name of the property.Supported property: `priority`.                                                              |
| **Mapping result**         | `<zeebe:priorityDefinition [property]="[userInput]" />`                                                                                |

The `zeebe:priorityDefinition` binding allows you to configure the [user task priority](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks#define-user-task-priority).

```json

{
  ...,
  "value": 42,
  "binding": {
    "type": "zeebe:priorityDefinition",
    "property": "priority"
  }
}

```

**Note**
When `zeebe:priorityDefinition` is used, [`zeebe:userTask`](#user-task-implementation-zeebeusertask) must be set on the same element.

If the template sets a static `value` for `priority`, it must be between 0 and 100.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
