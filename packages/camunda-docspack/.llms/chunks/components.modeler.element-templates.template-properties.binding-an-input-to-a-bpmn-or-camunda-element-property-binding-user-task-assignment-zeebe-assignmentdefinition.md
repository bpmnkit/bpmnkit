# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — User task assignment: `zeebe:assignmentDefinition`

| **Binding `type`**         | `zeebe:assignmentDefinition`                                                                                           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown`                                                                     |
| **Binding parameters**     | `property`: The name of the property.  Supported properties: `assignee`, `candidateGroups`, and `candidateUsers`. |
| **Mapping result**         | `<zeebe:assignmentDefinition [property]="[userInput]" />`                                                              |

The `zeebe:assignmentDefinition` binding allows you to configure the [user task assignment](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks#assignments).

```json
[
  {
    ...,
    "value": "=manager",
    "binding": {
      "type": "zeebe:assignmentDefinition",
      "property": "assignee"
    }
  },
  {
    ...,
    "value": "group1,group2",
    "binding": {
      "type": "zeebe:assignmentDefinition",
      "property": "candidateGroups"
    }
  },
  {
    ...,
    "value": "user1,user2,user3",
    "binding": {
      "type": "zeebe:assignmentDefinition",
      "property": "candidateUsers"
    }
  },
  ...
]
```

**Note**

When `zeebe:assignmentDefinition` is used, [`zeebe:userTask`](#user-task-implementation-zeebeusertask) must be set on the same element.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
