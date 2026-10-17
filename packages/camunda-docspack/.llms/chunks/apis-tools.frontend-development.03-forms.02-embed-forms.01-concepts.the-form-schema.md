# Concepts — The form schema

A form is serialized as plain JSON with a simple, flat structure to maximize flexibility and versatility. In the root, a form contains some metadata attributes. The main form is defined by a list of components, where the components carry their layout properties themselves (e.g. which row a component belongs to). This is in contrast to markup languages such as HTML, where the arrangement of the nodes determines the layout. This enables backward compatibility and compatibility with user-defined renderers.

See this simple form schema for example, and the resulting form:

```json
{
  "components": [
    {
      "label": "First name",
      "type": "textfield",
      "layout": {
        "row": "Row_0hqc9xn",
        "columns": null
      },
      "id": "Field_05l2s7c",
      "key": "firstName"
    },
    {
      "label": "Last name",
      "type": "textfield",
      "layout": {
        "row": "Row_0hqc9xn",
        "columns": null
      },
      "id": "Field_0nw7e1c",
      "key": "lastName"
    },
    {
      "label": "Income",
      "type": "number",
      "layout": {
        "row": "Row_1ggwq2d",
        "columns": 8
      },
      "id": "Field_12yshuy",
      "key": "monthlyNetIncome",
      "description": "Monthly net income",
      "appearance": {
        "prefixAdorner": "USD"
      },
      "increment": "100",
      "validate": {
        "required": true,
        "min": 0
      }
    }
  ],
  "type": "default",
  "id": "ExampleForm",
  "executionPlatform": "Camunda Cloud",
  "executionPlatformVersion": "8.4.0",
  "exporter": {
    "name": "Camunda Modeler",
    "version": "5.18.0"
  },
  "schemaVersion": 12
}
```

All form-js packages share the same [JSON schema](https://github.com/bpmn-io/form-js/tree/develop/packages/form-json-schema)  for forms.

This enables the interoperability of the created forms between the form editor and the viewer and possibly also between custom-made form renderers, or translating from a Camunda Form to another form. Using the form schema, you can write extensions to existing components, while still receiving benefits from updates made to the core form-js libraries.

The schema abstracts the form model from the viewer, and allows you to inject another expression or templating language as an alternative to FEEL, since expressions are simply stored as strings.

The schema is built on top of and validated by [`json-schema@draft-07`](https://json-schema.org/draft-07/json-schema-release-notes.html).

**Tip**
You can use tools like this [JSON Schema Viewer](https://navneethg.github.io/jsonschemaviewer/) to explore the schema visually, or this [tool from Atlassian](https://json-schema.app/view/%23?url=https%3A%2F%2Funpkg.com%2F%40bpmn-io%2Fform-json-schema%401.6.0%2Fresources%2Fschema.json) to validate a form against the schema.

### Schema variables

Form-js comes with versatile methods to extract the expected input and output variables from a form schema. This makes it easy to validate the input and output of a form, and you can combine it with data validation libraries like [joi](https://github.com/hapijs/joi)  to ensure type and schema safety. Learn more about schema variables in the [embedding guide](https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/02-embed-in-javascript).

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/02-embed-forms/01-concepts
