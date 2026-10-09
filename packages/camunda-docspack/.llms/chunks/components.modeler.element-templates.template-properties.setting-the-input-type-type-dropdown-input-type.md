# Template properties — Setting the input type: `type` — Dropdown input type

The `Dropdown` type allows users to select from a number of pre-defined options that are stored in a `choices` array as `{ name : String, value : String }` pairs:

```json
{
  "label": "REST Method",
  "description": "Specify the HTTP method to use.",
  "type": "Dropdown",
  "value": "get",
  "choices": [
    {
      "name": "GET",
      "value": "get"
    },
    {
      "name": "POST",
      "value": "post"
    },
    {
      "name": "PATCH",
      "value": "patch"
    },
    {
      "name": "DELETE",
      "value": "delete"
    }
  ],
  "binding": {
    "type": "zeebe:taskHeader",
    "key": "method"
  }
}
```

The resulting properties panel control looks like this:

![properties panel drop down](./img/field-dropdown.png)

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
