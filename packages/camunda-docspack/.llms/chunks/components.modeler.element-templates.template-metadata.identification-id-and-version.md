# Template metadata — Identification: `id` and `version`

- `id : String` is a required key and must be set.
- `version : Integer` is optional but Camunda strongly recommends setting it. When using the [Camunda Hub catalog](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started), the version is required.

The `id` key defines the identifier of the template.
If no `version` is set, templates with the same `id` are regarded as equal, independent of their other key-value pairs.
If `version` is set, the modeler treats templates with the same `id ` and `version` as identical, independent of their other key-value pairs.
Thus, if you plan to make any changes to your template and want to support [template evolution](https://github.com/bpmn-io/element-templates/blob/main/docs/LIFE_CYCLE.md#overview), maintain a `version` key-value pair on your template.
Templates with the same `id` and different `version` values offer an upgrade path.

```json
{
  "id": "sometemplate",
  "version": 1,
  ...
}
```

Once a template with a new `version` is available to users, the editor tooling suggests an upgrade, [preserving element configurations](https://github.com/bpmn-io/element-templates/blob/main/docs/LIFE_CYCLE.md#upgrade-behavior) on a best-effort basis.

**Tip**
Versioning is an important cornerstone of template evolution. Review the [upstream documentation](https://github.com/bpmn-io/element-templates/blob/main/docs/LIFE_CYCLE.md#overview) to understand the foundations of our upgrade mechanism and of the element template lifecycle.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
