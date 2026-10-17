# Template properties — Generating a value: `generatedValue`

As an alternative to static `value`, you can use a generated value. The value is generated when a property is applied to an element. Currently, the generated value can be a UUID:

```json
{
  "generatedValue": {
    "type": "uuid"
  },
  "type": "Hidden",
  "binding": {
    "type": "zeebe:property",
    "name": "id"
  }
}
```


## Setting a text placeholder: `placeholder`

The following property types support the `placeholder` attribute:

- [`String`](#string-input-type)
- [`Text`](#text-input-type)

The placeholder is displayed when a field is empty:

```json
{
  "label": "Web service URL",
  "type": "String",
  "binding": {
    ...
  },
  "placeholder": "https://example.com"
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
