# Import resources into Camunda Hub — Ignore templates

Camunda Hub ignores a template if it detects a **functionally equivalent** template already exists in your project or organization. This ensures that importing the template doesn’t break your existing setup.

A template is considered functionally equivalent when, after minifying the JSON, the following fields are equal:

- `id`
- `version`
- `appliesTo`
- `elementType`
- `groups`
- `properties`

When a template is ignored:

- The imported template is not added as a new resource.
- The project uses the existing template definition instead.
- There may be small differences in:
  - Display name.
  - Documentation URL.
  - Icon.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/importing-resources
