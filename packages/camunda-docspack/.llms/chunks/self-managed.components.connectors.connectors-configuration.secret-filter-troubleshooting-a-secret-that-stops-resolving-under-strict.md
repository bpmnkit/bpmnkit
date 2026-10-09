# Configuration — Secret filter — Troubleshooting a secret that stops resolving under STRICT

If a secret that previously resolved now comes back unresolved, or the connector job fails, under `STRICT` mode, check the following:

- For outbound connectors, the element is a supported BPMN type (`ServiceTask`, `SendTask`, `ScriptTask`, `BusinessRuleTask`, `SubProcess`, `IntermediateThrowEvent`, or `EndEvent`) with a `zeebe:input` mapping that contains the secret reference. Unsupported element types and supported elements without such an input mapping are treated as declaring no secrets and deny all resolution under `STRICT`.
- The secret is referenced using the `{{secrets.NAME}}` syntax in the same field where you expect it to resolve. A reference declared on one field doesn't resolve on a different field, unless the model chains the two fields together with a FEEL expression.
- The `{{secrets.NAME}}` reference sits inside a JSON string, like any other field value. An unquoted placeholder on a non-string field (for example, `"count": {{secrets.MAX}}`) is never substituted.
- The process definition is available to the connector runtime. Under `STRICT`, a Zeebe job fails and retries if the process definition can't be retrieved.

If you need to keep jobs processing while you investigate, switch to `LAX` temporarily. It falls back to allowing all secrets when the process definition lookup fails.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
