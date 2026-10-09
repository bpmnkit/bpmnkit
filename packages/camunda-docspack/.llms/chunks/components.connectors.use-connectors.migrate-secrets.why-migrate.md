# Migrate to `camunda.secrets.<name>` — Why migrate

Resolving secrets centrally in the Orchestration Cluster gives you capabilities the connector runtime's own resolution doesn't have:

- **Field-scoped resolution**: a reference only resolves at the field where it was written. See [secret resolution](https://docs.camunda.io/docs/next/components/concepts/secret-resolution#reference-syntax) and [security notice 61](https://docs.camunda.io/docs/next/reference/notices#notice-61) for the legacy behavior this replaces.
- **External secret store support**: in Self-Managed, values come from a File, AWS Secrets Manager, or GCP Secret Manager store instead of environment-variable-based [connector secret providers](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#secrets). See [secrets configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secrets).
- **Resource-based access control**: the `SECRET` resource's `READ` and `REVEAL` authorizations govern who can list and reveal secrets through the API. See [Control access to secrets](https://docs.camunda.io/docs/next/components/concepts/secrets#control-access-to-secrets).
- **Resolution kept off the connector runtime path**: references resolve ahead of job activation, so a value never lands in a record, runtime state, or log. See [Secret resolution and job activation](https://docs.camunda.io/docs/next/components/concepts/secret-resolution-and-job-activation).

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/migrate-secrets
