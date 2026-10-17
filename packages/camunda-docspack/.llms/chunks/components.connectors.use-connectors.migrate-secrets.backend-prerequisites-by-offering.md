# Migrate to `camunda.secrets.<name>` — Backend prerequisites by offering

Before `camunda.secrets.<name>` can resolve, its store must hold the secret values. What that requires depends on your offering:

- **SaaS**: no backend change is needed. The managed secrets you create on a cluster's **Cluster secrets** tab are available to both the legacy syntax and `camunda.secrets.<name>`, so you can start migrating models right away. See [Manage connector secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets#reference-connector-secrets-as-camundasecretsname).
- **Self-Managed**: an operator must configure a secret store (File, AWS Secrets Manager, or GCP Secret Manager) for the Orchestration Cluster. The connector runtime's secret providers alone are not enough: `camunda.secrets.<name>` doesn't read them. See [secrets configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secrets).

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/migrate-secrets
