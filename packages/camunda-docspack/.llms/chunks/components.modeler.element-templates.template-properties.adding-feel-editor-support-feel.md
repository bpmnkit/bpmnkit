# Template properties — Adding FEEL editor support: `feel`

The following input types support the `feel` property:

- `String`
- `Text`
- `Number`
- `Boolean`

### FEEL required

The properties panel will display the field as a FEEL editor and will show a visual indication that a FEEL expression is required:

```json
{
  "label": "Required FEEL Expression",
  "type": "String",
  "feel": "required",
  ...
}
```

### FEEL optional

The properties panel will show an indicator to switch to a FEEL expression. When activated, the field displays as a FEEL editor:

```json
    {
  "label": "Optional FEEL Expression",
  "type": "String",
  "feel": "optional",
  ...
}
```

For `Boolean` and `Number` fields, the value will always be persisted as a FEEL expression. This ensures that the value will not be interpreted as a string when evaluated in the engine.

### FEEL static

The value of `feel: static` is only valid for `Boolean` and `Number` fields.
Similar to [FEEL optional](#feel-optional), the value of the field will be persisted as a FEEL expression.
However, there is no toggle to switch to a FEEL editor and only a static value can be entered:

```json
{
  "label": "Static FEEL value",
  "type": "Number",
  "feel": "static",
  ...
}
```

For binding types `zeebe:input` and `zeebe:output`, `feel: static` is the default value used in case of missing `feel` property.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
