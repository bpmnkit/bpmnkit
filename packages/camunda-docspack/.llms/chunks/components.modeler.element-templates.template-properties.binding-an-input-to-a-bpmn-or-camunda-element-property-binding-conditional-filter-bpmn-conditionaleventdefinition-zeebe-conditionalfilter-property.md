# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Conditional filter: `bpmn:ConditionalEventDefinition#zeebe:conditionalFilter#property`

| **Binding `type`**         | `bpmn:ConditionalEventDefinition#zeebe:conditionalFilter#property`            |
| -------------------------- | ----------------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden`                                            |
| **Binding parameters**     | `name`: The name of the property.Supported properties: `variableEvents`. |
| **Mapping result**         | `<zeebe:conditionalFilter [name]="[userInput]" />`                            |

The `bpmn:ConditionalEventDefinition#zeebe:conditionalFilter#property` binding allows you to configure the conditional filter for [conditional events](https://docs.camunda.io/docs/next/components/modeler/bpmn/conditional-events/conditional-events). The conditional filter controls which variable changes trigger the condition evaluation.

```json
[
  {
    "label": "Variable Events",
    "type": "String",
    "value": "create,update",
    "binding": {
      "type": "bpmn:ConditionalEventDefinition#zeebe:conditionalFilter#property",
      "name": "variableEvents"
    }
  }
]
```

**Note**

**Property descriptions:**

- **`variableEvents`**: A comma-separated list of variable events (`create`, `update`) that trigger condition evaluation.

When `bpmn:ConditionalEventDefinition#zeebe:conditionalFilter#property` is used, `bpmn:ConditionalEventDefinition#property` with `condition` should also be set on the same element.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
