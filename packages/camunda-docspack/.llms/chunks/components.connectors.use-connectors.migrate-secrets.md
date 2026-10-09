# Migrate to `camunda.secrets.<name>`

Move connector models from the legacy {{secrets.<name>}} syntax to the recommended camunda.secrets.<name> syntax, using the connector runtime's fallback mode for incremental migration.

`camunda.secrets.<name>` is the recommended secret reference syntax, resolved centrally by the [Orchestration Cluster](https://docs.camunda.io/docs/next/reference/glossary#orchestration-cluster) rather than by the [connector runtime](https://docs.camunda.io/docs/next/reference/glossary#connector-runtime). This page explains how to move existing connector models from the legacy `{{secrets.<name>}}` syntax to `camunda.secrets.<name>`, including a fallback mode that lets you migrate incrementally without updating every model at once.

**Note**
The legacy `{{secrets.<name>}}` syntax remains fully supported, so you can migrate at your own pace.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/migrate-secrets
