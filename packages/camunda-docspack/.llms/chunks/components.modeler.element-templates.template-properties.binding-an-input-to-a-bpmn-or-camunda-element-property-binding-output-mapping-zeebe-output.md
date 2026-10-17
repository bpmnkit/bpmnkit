# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Output mapping: `zeebe:output`

| **Binding `type`**         | `zeebe:output`                                                                   |
| -------------------------- | -------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String` `Text``Hidden``Dropdown``Boolean``Number` |
| **Binding parameters**     | `source`: The source of the output parameter                                     |
| **Mapping result**         | `<zeebe:output target="[userInput]" source="[source] />`                         |

Configures an [output mapping](https://docs.camunda.io/docs/next/components/concepts/variables#output-mappings).

```json
{
  ...,
  "value": "aProcessVariableName",
  "binding": {
    "type": "zeebe:output",
    "source": "aTaskVariableName"
  }
}
```

**Tip: Dynamic output mappings**
You can let template users create their own output mappings by setting [`entriesVisible.outputs`](#control-specific-entry-visibility) to `true`. This shows the standard output mapping section in the properties panel, where users can add, edit, and remove output mappings.

You can't combine template-defined `zeebe:output` bindings with `entriesVisible.outputs = true`. Defining `zeebe:output` bindings in a template with dynamic output mappings enabled is restricted.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
