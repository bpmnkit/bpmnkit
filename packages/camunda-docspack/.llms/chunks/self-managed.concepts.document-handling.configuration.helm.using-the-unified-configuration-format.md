# Document handling configuration in Helm — Using the unified configuration format

To adopt the new `camunda.document.*` model for any provider, disable the corresponding `global.documentStore.type.<provider>.enabled` flag and configure the store via `extraConfiguration`. This also enables advanced scenarios such as multiple named store instances.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/configuration/helm
