# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Signal name: `bpmn:Signal#property`

| **Binding `type`**         | `bpmn:Signal#property`                                                 |
| -------------------------- | ---------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown`                     |
| **Binding parameters**     | `name`: The name of the property.  Supported properties: `name`. |
| **Mapping result**         | `<bpmn:signal [name]="[userInput]" />`                                 |

The `bpmn:Signal#property` binding allows you to set the name of a `bpmn:Signal` referred to by the templated element.
This binding is only valid for templates of events with `bpmn:SignalEventDefinition`.

```json
{
  ...,
  "value": "aSignalName",
  "binding": {
    "type": "bpmn:Signal#property",
    "name": "name"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
