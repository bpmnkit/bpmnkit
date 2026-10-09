# Migrate to `camunda.secrets.<name>` — Migrate step by step

1. **Prepare the store.** In Self-Managed, [configure a secret store](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secrets) for the Orchestration Cluster. In SaaS, confirm the secrets exist on the cluster's **Cluster secrets** tab.
1. **Copy the secret values.** Move each secret value from your connector secret provider into the store under the same name. Note that a name created or managed through the `/v2/secrets` API must match `[\p{Alnum}_-]+`; see [secret resolution](https://docs.camunda.io/docs/next/components/concepts/secret-resolution#reference-syntax) for the naming rules.
1. **(Optional) Enable fallback mode.** Set `camunda.connector.secret-resolver.legacy.mode` to `FALLBACK` on the connector runtime, as described in [Migrate incrementally with fallback mode](#migrate-incrementally-with-fallback-mode). Legacy references whose names are no longer supplied by a provider then resolve from the store, so models keep working while you migrate them.
1. **Update your models field by field.** Replace each `{{secrets.NAME}}` reference with `camunda.secrets.NAME`:
   - In an input mapping, use the FEEL expression `=camunda.secrets.NAME`. See [secret references in input mappings](https://docs.camunda.io/docs/next/components/concepts/variables#secret-references-in-input-mappings) for the syntax rules, including backtick-escaping dashed names.
   - In a connector or credential field, read the reference from a cluster variable of kind `SECRET_REFERENCE`. See [resolve secret references in a cluster variable](https://docs.camunda.io/docs/next/components/modeler/feel/cluster-variable/usage-guide#resolve-secret-references-in-a-cluster-variable).
1. **Remove the legacy configuration.** Once no model contains a `{{secrets.<name>}}` reference, set `camunda.connector.secret-resolver.legacy.mode` back to `ON` (or remove the setting) and remove the connector secret provider configuration.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/migrate-secrets
