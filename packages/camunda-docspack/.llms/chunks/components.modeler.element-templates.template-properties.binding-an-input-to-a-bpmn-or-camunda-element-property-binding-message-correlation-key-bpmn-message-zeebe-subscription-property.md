# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Message correlation key: `bpmn:Message#zeebe:subscription#property`

| **Binding `type`**         | `bpmn:Message#zeebe:subscription#property`         |
| -------------------------- | -------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown` |
| **Binding parameters**     | `name`: The name of the property                   |
| **Mapping result**         | `<zeebe:subscription [name]="[userInput]" />`      |

The `bpmn:Message#zeebe:subscription#property` binding allows you to set properties of a `zeebe:subscription` set within `bpmn:Message` referred to by the templated element. This binding is only valid for templates of events with `bpmn:MessageEventDefinition` and receive tasks.

```json
{
  ...,
  "value": "=aCorrelationKey",
  "binding": {
    "type": "bpmn:Message#zeebe:subscription#property",
    "name": "correlationKey"
  }
}
```

**Note**

The binding name of `correlationKey` is not applicable to message start events on a process. In such cases, the property is automatically hidden.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
