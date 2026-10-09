# Property reference — Secrets

Configure the secret stores and cache used to resolve `camunda.secrets.<name>` references in process variables.

See [Secret resolution](https://docs.camunda.io/docs/next/components/concepts/secret-resolution) for the reference syntax and how references are resolved.

**Note**
This secret store configuration applies only to Self-Managed. In SaaS, the secret store is provisioned and managed for you, so you don't configure a store type, path, or credentials. Manage secret values on the cluster's **Cluster secrets** tab and reference them as `camunda.secrets.<key>`. See [Manage connector secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets#reference-connector-secrets-as-camundasecretsname).

`camunda.secrets.*` sets the defaults inherited by every physical tenant. Override them per physical tenant under `camunda.physical-tenants.<tenant-key>.secrets.*`. See [Validation and constraints](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference#validation-and-constraints) in the Physical Tenants configuration reference.

`<id>` is the store identifier and must be `default`. Each physical tenant supports exactly one secret store across all store types. For example, configuring both a file store and an AWS store counts as two stores.

Camunda validates this constraint against the merged configuration for each tenant. If a tenant inherits a store, you cannot add another store under a different ID to override it. To override an inherited store, reuse the `default` ID.

A secret name must match `[\p{Alnum}_-]+` and be at most 240 characters to be listed and resolved through `/v2/secrets` (the reference `camunda.secrets.<name>` is capped at 256 characters, and the `camunda.secrets.` prefix takes 16 of those). A period (`.`), such as the one used in a file extension, falls outside the allowed character set. Camunda stores a secret whose name fails either check, but omits it from list results and cannot resolve it by reference.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
