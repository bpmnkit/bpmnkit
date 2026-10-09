# Template properties — Preventing persisting empty values: `optional`

We support optional bindings that do not persist empty values in the underlying BPMN 2.0 XML.
If a user removes the value from the input field in the properties panel, it will also remove the mapped element.
This works as follows:

- `true`: When the user removes the value (or leaves the field empty), the empty values are NOT persisted.
- `false`: When the user removes the value, the empty values ARE persisted in the XML. This is the default behavior.
  The following binding types can be `optional`:

- [`zeebe:input`](#input-mapping-zeebeinput)
- [`zeebe:output`](#output-mapping-zeebeoutput)
- [`zeebe:taskHeader`](#header-zeebetaskheader)
- [`zeebe:property`](#extension-properties-zeebeproperty)

Example:

```json
{
  "label": "Request",
  "type": "String",
  "optional": true,
  "binding": {
    "type": "zeebe:input",
    "name": "request"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
