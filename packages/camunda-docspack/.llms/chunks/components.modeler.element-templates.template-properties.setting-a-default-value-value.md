# Template properties — Setting a default value: `value`

The `value` key defines a static default value for a property.
The value is applied to the property defined by the [`binding`](#binding-an-input-to-a-bpmn-or-camunda-element-property-binding) when the template is applied to an element until a user provides their own input value.
`value` should be defined whenever the input type is [`Hidden`](#hidden-input-type).
The value of `value` must match the `type` of the property and must be a string if the `type` is hidden.

```json
{
  "value": "4",
  "type": "Hidden",
  "binding": {
    "type": "zeebe:taskDefinition",
    "property": "retries"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
