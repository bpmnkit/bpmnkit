# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Message name: `bpmn:Message#property`

| **Binding `type`**         | `bpmn:Message#property`                            |
| -------------------------- | -------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown` |
| **Binding parameters**     | `name`: The name of the property                   |
| **Mapping result**         | `<bpmn:message [name]="[userInput]" />`            |

The `bpmn:Message#property` binding allows you to set properties of a `bpmn:Message` referred to by the templated element. This binding is only valid for templates of events with `bpmn:MessageEventDefinition`, receive tasks, and send tasks.

```json
{
  ...,
  "generatedValue": {
    "type": "uuid"
  },
  "binding": {
    "type": "bpmn:Message#property",
    "name": "name"
  }
}
```

**Note**
When designing a template for a message receive task or event, it is sufficient to define the binding for the message [name](#message-name-bpmnmessageproperty) and the [correlation key](#message-correlation-key-bpmnmessagezeebesubscriptionproperty).
The message ID is automatically generated when the template is applied. The `messageRef` [property](#primitive-bpmn-properties-property) does not have to be defined.

Remember that the message [name and correlation key](https://docs.camunda.io/docs/next/components/concepts/messages#message-subscriptions) define the correlation characteristics of a message and can be shared by [multiple process definitions](https://docs.camunda.io/docs/next/components/concepts/messages#message-cardinality).

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
