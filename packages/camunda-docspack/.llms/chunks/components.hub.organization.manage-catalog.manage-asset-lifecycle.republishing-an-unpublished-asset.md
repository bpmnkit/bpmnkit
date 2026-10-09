# Manage the asset lifecycle — Republishing an unpublished asset

To republish an unpublished asset:

- Add the asset's directory back to the repository.
- [Increment the element template's version](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started#version-your-element-templates).

If you don't increment the element template's version, you'll receive a `400` response.


## Delete an asset

To permanently remove an asset from the catalog, use the Camunda Hub API delete endpoint:

```
DELETE <camunda-hub-api-base-url>/api/v2/catalog/assets/{assetKey}
```

For the full request and response schema, see the **Delete a catalog asset** reference for [SaaS](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/delete-catalog-asset.api) or [Self-Managed](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/delete-catalog-asset.api). Your API token must have the Hub API `delete` permission.

Deleting an asset removes it and all of its versions entirely:

- Center of excellence and delivery teams can no longer find it while browsing the catalog.
- Its element template can no longer be resolved in diagrams.

Values already configured on diagram elements remain in the BPMN file, but the template definition—including labels, groupings, and validation—is no longer applied. The element is shown as a [missing template](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/using-templates#missing-templates).

**Warning**
Deletion is irreversible. Use it to correct mistakes or remove assets that should never have been published. To phase out assets, prefer unpublishing so the template is deprecated and delivery teams have a clear migration path.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/manage-asset-lifecycle
