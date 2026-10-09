# Document handling configuration in Camunda 8 Run

Learn more about storage configuration options for Camunda 8 Run setups.

**Note**
[Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) can be used for local development only, and none of the storage options below are suitable for production.

Document Store configuration uses the unified `camunda.document.*` Spring property model. The sections below show the new configuration format. If you're migrating from legacy `DOCUMENT_*` environment variables, see [property mapping reference](#property-mapping-reference).

Provide these properties in an `application.yaml` file. For example, set `camunda.document.default-store-id` to specify the active store.

If no storage configuration is provided, the default document storage is **in-memory**. Documents are lost when the application is stopped.

**Warning: Deprecated: `DOCUMENT_*` and `DOCUMENT_STORE_*` environment variables**

The legacy `DOCUMENT_*` and `DOCUMENT_STORE_*` environment variables (for example, `DOCUMENT_STORE_AWS_BUCKET`, `DOCUMENT_DEFAULT_STORE_ID`) are deprecated. They continue to work for at least one release cycle via a backward compatibility bridge, but will be removed in a future release. When both the unified `camunda.document.*` properties and the legacy environment variables are set, `camunda.document.*` takes precedence.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/camunda-8-run
