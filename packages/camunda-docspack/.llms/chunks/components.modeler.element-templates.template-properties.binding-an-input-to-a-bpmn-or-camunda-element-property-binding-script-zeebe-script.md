# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Script: `zeebe:script`

| **Binding `type`**         | `zeebe:script`                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown`                                                   |
| **Binding parameters**     | `property`: The name of the property. Supported properties: `expression` and `resultVariable`. |
| **Mapping result**         | `<zeebe:script [property]="[userInput]" />`                                                          |

The `zeebe:script` binding allows you to configure the [FEEL expression](https://docs.camunda.io/docs/next/components/modeler/bpmn/script-tasks#defining-a-task) used by a script task.

```json
[
  {
    ...,
    "value": "= a + b",
    "binding": {
      "type": "zeebe:script",
      "property": "expression"
    }
  },
  {
    ...,
    "value": "result",
    "binding": {
      "type": "zeebe:script",
      "property": "resultVariable"
    }
  },
  ...
]
```

**Note**
When `zeebe:script` is used, `zeebe:taskDefinition` cannot be used on the same element.
If the input `type` is `String` or `Text`, then [`feel`](#adding-feel-editor-support-feel) must be set to `required`"

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
