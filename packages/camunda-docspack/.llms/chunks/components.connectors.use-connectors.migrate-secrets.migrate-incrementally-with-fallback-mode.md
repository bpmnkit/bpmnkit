# Migrate to `camunda.secrets.<name>` — Migrate incrementally with fallback mode

You don't have to update every model at once. The connector runtime's `camunda.connector.secret-resolver.legacy.mode` setting controls where legacy references resolve from:

- `ON` (default): the runtime resolves `{{secrets.<name>}}` only from its configured secret providers.
- `FALLBACK`: when a legacy reference's name isn't found in a configured secret provider, the runtime looks the name up in the same secret store that backs `camunda.secrets.<name>`.

With `FALLBACK` set, you can move a secret's value into the Orchestration Cluster's store first and keep existing models on the legacy syntax. Models you haven't touched keep resolving, now from the store, while you update them field by field. Once no legacy references remain, set the mode back to `ON` and remove the provider configuration.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/migrate-secrets
