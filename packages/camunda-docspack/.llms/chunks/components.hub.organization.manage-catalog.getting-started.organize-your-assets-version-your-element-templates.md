# Get started with the catalog — Organize your assets — Version your element templates

The catalog uses the `id` and `version` fields inside your element template definition to track versions:

```json
{
  "$schema": "https://unpkg.com/@camunda/element-templates-json-schema/resources/schema.json",
  "id": "com.example.payment-connector",
  "name": "Payment Connector",
  "version": 2,
  "appliesTo": ["bpmn:ServiceTask"],
  "properties": []
}
```

While `version` is [optional in the element template schema](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates#optional-keys), the catalog _requires_ it. A template submitted without a `version` is rejected.

When you submit assets to the catalog API, Camunda Hub compares each submitted template against the latest stored version with the same `id`:

- If the template **content is identical** to the latest stored version, no new version is created. Changes to the README, including the description, category, and tags, are still applied to the asset.
- If the template **content has changed**, and the `version` field is **greater** than the latest stored version, a new version is published as the latest version.
- If the template **content has changed**, but the `version` field is **less than or equal to** the latest stored version, the **entire submission is rejected** with a `400 Bad Request`. The version must always increase. Reusing an older or equal number is not allowed, even if no other asset uses it.

Additionally, every `id` in a single submission must be unique. If two templates share the same `id`, the entire submission is rejected with a `400 Bad Request`.

**Warning**
Always increment the `version` when you change an element template's content. The catalog API validates the whole submission as a single transaction. If any asset fails validation, _no_ changes are applied.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
