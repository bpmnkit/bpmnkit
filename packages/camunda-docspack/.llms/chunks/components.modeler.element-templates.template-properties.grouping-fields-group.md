# Template properties — Grouping fields: `group`

Associate a field with a group (ID) via the field's `group` key:

```json
{
  ...,
  "groups": [
    {
      "id": "definition",
      "label": "Task definition",
      "openByDefault": true
    }
  ],
  "properties": [
    {
      "group": "definition",
      "label": "Task type",
      "type": "String",
      "value": "http-job",
      "binding": {
        "type": "zeebe:taskDefinition",
        "property": "type"
      }
    },
    ...
  ]
}
```


## Validating user input: `constraints`

Custom fields may have a number of constraints associated with them:

- `notEmpty : Boolean`: Input must be non-empty, when set to `true`.
- `minLength : Integer`: Minimum length for the input.
- `maxLength : Integer`: Maximum length for the input.
- `pattern : Object`: Regular expression to match the input against.

### Validating against a regex: `pattern`

Set `pattern` to a regular expression to ensure the user's input matches the pattern.
Together with the `pattern` constraint, you can define a custom error message:

```json
{
  "label": "Web service URL",
  "type": "String",
  "binding": {
    ...
  },
  "constraints": {
    "notEmpty": true,
    "pattern": {
      "value": "https://.*",
      "message": "Must be https URL"
    }
  }
}
```

**Warning**
When a template exposes a property to a user, the template is responsible for showing all validation errors in the properties panel.
That includes non-compliance with BPMN and Zeebe schema constraints. You should therefore use `notEmpty` where necessary.

The problems panel shows errors for invalid properties, whether or not a template is applied.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
