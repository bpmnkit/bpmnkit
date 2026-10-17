# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Primitive BPMN properties: `property`

| **Binding `type`**         | `property`                         |
| -------------------------- | ---------------------------------- |
| **Valid property `type`s** | All property types are supported   |
| **Binding parameters**     | `name`: The name of the property   |
| **Mapping result**         | `<... [name]="[userInput]" ... />` |

Configures generic BPMN element properties that are text, boolean, and numeric types.
Additionally, expression types `completionCondition` and `conditionExpression` are supported.
Other properties, such as references and complex property types, are currently NOT supported and will lead to runtime errors when modeling.

```json
[
  {
    ...,
    "value": "= someValue >= 1",
    "binding": {
      "type": "property",
      "name": "completionCondition"
    }
  },
  {
    ...,
    "value": "customPropertyValue",
    "binding": {
      "type": "property",
      "name": "mynamespace:customProperty"
    }
  },
  ...
]
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
