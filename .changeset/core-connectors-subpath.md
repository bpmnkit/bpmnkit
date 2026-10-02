---
"@bpmnkit/core": minor
"@bpmnkit/connectors": minor
---

The connector catalog moved into core as `@bpmnkit/core/connectors`: `listConnectors`, `searchConnectors`, `getTemplate`, `applyConnectorTemplate`, `applyElementTemplate`, `applyTemplateToElement`, `validateElementTemplate` and the template types, with the Camunda 8 out-of-the-box templates as `BUNDLED_CONNECTOR_TEMPLATES`. It is a separate entry, so `@bpmnkit/core` itself does not grow.

Core's templates leave out icons, groups, tooltips and placeholders, which only a property panel draws. `@bpmnkit/connectors` keeps its API and re-exports core's, storing only those parts and putting the full templates back together: `getTemplate`, `applyConnectorTemplate` and `CAMUNDA_CONNECTOR_TEMPLATES` still answer with full templates, icons included. It no longer depends on `@bpmnkit/feel`, and a bundle that imports it is slightly smaller than before, since the catalog is not shipped twice.

`pnpm update-connectors` writes both halves from one fetch, writes nothing when the registry is unchanged, and runs weekly in `.github/workflows/connector-templates.yml`, which opens a pull request.
