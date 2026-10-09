# Manage the asset lifecycle — Unpublish an asset

When your CI/CD pipeline submits assets, the submission represents the _full desired state_ of the catalog. Any asset that already exists in Camunda Hub but is not included in the submission is automatically unpublished. Therefore, to unpublish an asset, remove its directory from the asset repository, and run the sync pipeline again.

Unpublishing an asset also _deprecates_ its element template. Deprecated templates continue to work in existing diagrams, but are no longer offered when applying templates or creating elements.

Diagrams that reference deprecated templates show a [deprecation hint](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#deprecating-a-template-deprecated) in the modeler. This gives delivery teams a clear signal to migrate.

For the center of excellence, responsible for managing the catalog, the asset remains visible, so you can:

- Track which diagrams still reference the template.
- Encourage the migration of those diagrams to a newer version or a different template before the asset is removed entirely.

Unpublished assets that are still in use are reported as **Deprecated** in the [asset usage overview](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/track-asset-usage), where you can see the workspaces and projects that still reference them.

**Note**
Unpublishing is a catalog-level state that indicates the asset is no longer part of the current submission. Use it when an asset should no longer be offered to delivery teams—for example, when you replace a connector with a successor and want to drive migration off the old one.

Because unpublishing automatically deprecates the underlying element template, you don't need to manually set the `deprecated` property in the template to flag it as outdated; removing the asset from the submission is enough.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/manage-asset-lifecycle
