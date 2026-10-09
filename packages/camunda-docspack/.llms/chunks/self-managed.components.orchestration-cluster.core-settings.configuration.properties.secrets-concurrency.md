# Property reference — Secrets — Concurrency

Applies only to a store whose cost scales with the number of names requested (for example, AWS Secrets Manager without `batch-enabled`, which issues one `GetSecretValue` call per name). A store that resolves a whole request in a single call, such as the file store or a store using `container-secret-id`, is unaffected.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
