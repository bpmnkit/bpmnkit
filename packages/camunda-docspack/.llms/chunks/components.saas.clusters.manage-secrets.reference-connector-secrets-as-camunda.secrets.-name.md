# Manage connector secrets — Reference connector secrets as `camunda.secrets.<name>`

In SaaS, you can also reference the connector secrets you create here through centralized secret resolution by using `camunda.secrets.<key>`. You can use these references in input mappings and Connector fields, in addition to the legacy `{{secrets.KEY}}` syntax.

To learn how to use these references, see [Secret references in input mappings](https://docs.camunda.io/docs/next/components/concepts/variables#secret-references-in-input-mappings). To understand how Camunda resolves a reference before job activation, see [Secret resolution and job activation](https://docs.camunda.io/docs/next/components/concepts/secret-resolution-and-job-activation).

In SaaS, the secret store is provisioned and managed for you. You don't configure a store type, path, or credentials. Add and update values on the **Cluster secrets** tab; the cluster can resolve them without additional setup.

In Self-Managed, an operator must [configure the secret store](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secrets).

A reference name must match `[\p{Alnum}_-]+`. Only keys that contain letters, digits, `_`, and `-` can therefore be referenced as `camunda.secrets.<key>`. A key that contains a period (`.`), such as one used in a file extension, is stored but cannot be referenced this way. A key with a `-` must be backtick-escaped in FEEL (for example, `` =camunda.secrets.`db-password` ``), because a bare `-` is FEEL's minus operator.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets
