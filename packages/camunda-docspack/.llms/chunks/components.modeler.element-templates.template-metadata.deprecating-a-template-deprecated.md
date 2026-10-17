# Template metadata — Deprecating a template: `deprecated`

- `deprecated` is an optional key.

Use `deprecated` to mark a [template as deprecated](https://github.com/bpmn-io/element-templates/blob/main/docs/LIFE_CYCLE.md#deprecation).

**Info**
By deprecating an element template, you prevent its _future use_. Users will no longer see the template when choosing a template, changing an element's type, or creating a new element. Existing uses continue to work, with a deprecation hint shown in the modeler UI.

The `deprecated` property can be an object or a boolean. If an object, it has the following attributes:

- `message: String`: A message to display to the user
- `documentationRef : String`: A link to documentation, i.e., to describe upgrade migration procedures

This information allows users to make sense of the deprecation and understand how to migrate to an undeprecated template:

```json
{
  ...,
  "deprecated": {
    "message": "Migrate to My Other Custom Task",
    "documentationRef": "https://localhost/migrate-to-other"
  },
  ...
}
```

When `deprecated` is a boolean (`true`), a deprecation hint appears in the properties panel without further help for the user:

```json
{
  ...,
  "deprecated": true,
  ...
}
```

**Tip**
Review the [upstream documentation](https://github.com/bpmn-io/element-templates/blob/main/docs/LIFE_CYCLE.md#overview) to learn more about template evolution and the template lifecycle.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
