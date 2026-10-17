# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Input mapping: `zeebe:input`

| **Binding `type`**         | `zeebe:input`                                                                    |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String` `Text``Hidden``Dropdown``Boolean``Number` |
| **Binding parameters**     | `name`: The name of the input parameter                                          |
| **Mapping result**         | `<zeebe:input target="[name]" source="[userInput] />`                            |

Configures an [input mapping](https://docs.camunda.io/docs/next/components/concepts/variables#input-mappings).

```json
{
  ...,
  "value": "aProcessVariableName",
  "binding": {
    "type": "zeebe:input",
    "name": "aTaskVariableName"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
