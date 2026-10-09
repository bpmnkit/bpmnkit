# Manage the asset lifecycle

Unpublish and delete catalog assets as a center of excellence to drive safe migrations for delivery teams.

Unpublish and delete catalog assets to drive safe migrations for delivery teams.


## Prerequisites

Before you start, make sure you have [set up the catalog](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started) and can submit assets through your CI/CD pipeline.


## How delivery teams see asset versions

As a center of excellence, you control which element templates delivery teams can discover and apply through the catalog. Over time you will update assets, replace them with successors, or remove them entirely. When you do, this affects how delivery teams see and use the assets.

### Browsing assets

When browsing the catalog, your delivery teams only see the **latest published version** of an asset. Older versions are not offered for new diagrams, and unpublished and deleted assets are not discoverable at all.

### Used assets

Diagrams that already reference a template continue to work with [unpublished assets](#unpublish-an-asset), but when an asset is unpublished, its template is also [deprecated](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#deprecating-a-template-deprecated), so those diagrams show a deprecation hint that prompts teams to migrate.

[Deleted assets](#delete-an-asset) used in diagrams are displayed as [missing templates](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/using-templates#missing-templates) and can't be resolved.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/manage-asset-lifecycle
