# How to use connectors — Using credentials — Using `camunda.secrets.*` references

You can also reference a secret directly in a Connector input mapping by using `camunda.secrets.<name>` in a FEEL expression.

In SaaS, use the [connector secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets#reference-connector-secrets-as-camundasecretsname) you manage on the cluster. No secret store configuration is required. In Self-Managed, an operator must [configure the secret store](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secrets). See [secret references in input mappings](https://docs.camunda.io/docs/next/components/concepts/variables#secret-references-in-input-mappings) for the syntax and its rules.

These forms coexist and are handled differently:

- `{{secrets.*}}` remains fully supported for existing process models. It's still resolved by the connector runtime itself, at execution time, exactly as described above; the runtime keeps receiving it as plain placeholder text in the job's input.
- `camunda.secrets.<name>` is resolved before the job reaches any worker, including a connector runtime. The connector receives the value already in place, the same way whether the connector runtime is co-located with the cluster or run separately (for example, a self-managed runtime connecting to a SaaS cluster).
- A [cluster variable](https://docs.camunda.io/docs/next/components/modeler/feel/cluster-variable/data-types) of kind `SECRET_REFERENCE` can hold `camunda.secrets.<name>` references in its value. A connector field that reads such a variable, for example `=camunda.vars.env.MY_CONFIG`, receives the resolved value the same way, because the references are recorded on the job and resolved before activation. See [resolve secret references in a cluster variable](https://docs.camunda.io/docs/next/components/modeler/feel/cluster-variable/usage-guide#resolve-secret-references-in-a-cluster-variable).

`{{secrets.*}}` values are not scoped per [physical tenant](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime#per-tenant-secret-access) unless you opt in to `physicaltenantaware` in the connector runtime's own configuration. Physical tenant scoping of `camunda.secrets.<name>` is separate from that setting: each physical tenant resolves its own configured secret store.

`{{secrets.*}}` and `camunda.secrets.<name>` can be migrated independently of where the value is stored. If you move a secret value into the store that `camunda.secrets.<name>` uses but keep existing process models on the legacy `{{secrets.NAME}}` syntax, set `camunda.connector.secret-resolver.legacy.mode` to `FALLBACK` on the connector runtime: a legacy-style reference whose name isn't found in a configured secret provider is then looked up in that same store. The default, `ON`, only resolves legacy references from the configured providers. See [Migrate to `camunda.secrets.<name>`](https://docs.camunda.io/docs/next/components/connectors/use-connectors/migrate-secrets) for step-by-step migration guidance.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
