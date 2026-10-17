# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Extension properties: `zeebe:property`

| **Binding `type`**         | `zeebe:property`                                      |
| -------------------------- | ----------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown`    |
| **Binding parameters**     | `name`: The name of the property                      |
| **Mapping result**         | `<zeebe:property name="[name]" value="[userInput] />` |

The `zeebe:property` binding allows you to set any arbitrary property for an outside system. It does not impact execution of the Zeebe engine.

```json
{
  ...,
  "value": "{\"outputVar\": 5}",
  "binding": {
    "type": "zeebe:property",
    "name": "camundaModeler:exampleOutputJson"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
