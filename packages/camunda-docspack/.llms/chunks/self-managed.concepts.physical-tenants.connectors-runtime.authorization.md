# Connectors runtime: Physical Tenant support — Authorization

Each `camunda.clients.*` entry authenticates independently using its own `auth.*` credentials, so grant permissions per Physical Tenant to the identity configured for that client.

Each client's identity needs the standard permissions to activate, complete, and fail jobs for the process definitions it serves, plus read access to process definitions for inbound connector polling. See [Authorization model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model) for how permissions are scoped per Physical Tenant.


## Operational considerations

### Scaling

One runtime instance per cluster is standard. Deploy multiple instances only when you need runtime-layer resource isolation, such as performance SLA separation. Physical Tenants already isolate data structurally.

### Monitoring

Every connector metric is tagged with `physicalTenantId`, so outbound and inbound activity can be filtered and grouped per Physical Tenant. Two tenants running the same connector type report separately rather than collapsing into one series.

Tagged metrics include outbound invocation counts and execution times, the last-completed and last-failed timestamps, and inbound activation and trigger counts. Jobs handled by a single-client deployment that configures no `physical-tenant-id` are reported under the tag value `default`.

### Secret rotation

Secrets resolved through the environment secret provider are read from the runtime's environment, so rotating a value requires updating the environment variable and restarting the runtime.

Because a single runtime instance serves all configured Physical Tenants, rotating one tenant's secret restarts the shared runtime and therefore briefly interrupts every configured tenant. Plan rotations accordingly.

### Failure handling

A failure in one tenant's job workers does not affect workers registered for other tenants.

On the inbound side, a polling failure for one Physical Tenant is logged and does not stop the other tenants from completing their imports in the same cycle. The runtime's readiness signal is shared across tenants, however, so a persistent polling failure for a single tenant marks the whole runtime instance as not ready.

**Note: App integrations (MS Teams and similar)**
App integrations with Physical Tenant support are implemented and will be documented in a follow-up section once the configuration details are finalized. Multiple Keycloak (separate IdP per tenant in the connector context) is not supported.

[Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime
