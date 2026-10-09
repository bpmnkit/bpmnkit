# Configuration — Secret filter — Secure secret usage best practices

- Keep the mode at `STRICT` (the default) in production environments. Reserve `LAX` for cases where a temporary process definition API outage must not block connector jobs, and reserve `DISABLED` for troubleshooting only.
- Reference only the secrets a connector task actually needs, in the fields that need them. A task that references fewer secrets has a smaller allow-list, which limits what that task can resolve even when its other field values come from untrusted process variables.
- Scope secrets narrowly, for example one API key per integration or tenant, instead of reusing a single broad-access secret across multiple connector tasks.
- Under `STRICT`, you don't need to design BPMN diagrams defensively to keep a secret out of a task's other fields. The runtime enforces the allow-list per field: a secret declared on one field of a task isn't resolvable from a different field on that same task, or from a different task, unless the model itself chains them together with a FEEL expression.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
