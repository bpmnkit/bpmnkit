# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Conditional event definition property: `bpmn:ConditionalEventDefinition#property`

| **Binding `type`**         | `bpmn:ConditionalEventDefinition#property`                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden`                                                                                |
| **Binding parameters**     | `name`: The name of the property.Supported property: `condition`.                                            |
| **Mapping result**         | `<bpmn:conditionalEventDefinition><bpmn:condition>[userInput]</bpmn:condition></bpmn:conditionalEventDefinition>` |

The `bpmn:ConditionalEventDefinition#property` binding allows you to configure the condition expression for [conditional events](https://docs.camunda.io/docs/next/components/modeler/bpmn/conditional-events).
This binding is only valid for templates of events with `bpmn:ConditionalEventDefinition` set via `elementType.eventDefinition`.

```json
{
  "label": "Condition Expression",
  "type": "String",
  "value": "=orderTotal > 100",
  "feel": "required",
  "binding": {
    "type": "bpmn:ConditionalEventDefinition#property",
    "name": "condition"
  }
}
```

**Note**
The `condition` property requires a FEEL expression. When using `String` or `Text` input types, set `feel` to `required`.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
