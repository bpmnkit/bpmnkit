# Configuration — Multi-tenancy

The Connector Runtime supports multiple tenants for inbound and outbound connectors. These are configurable in [Orchestration Cluster Admin](https://docs.camunda.io/docs/next/components/admin/tenant).

A single Connector Runtime can serve a single tenant or can be configured to serve
multiple tenants. By default, the runtime uses the tenant ID `<default>` for all
Zeebe-related operations like handling jobs and publishing messages.

The tenants described on this page are logical tenants. Camunda 8 Self-Managed also supports [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants), which are strongly isolated execution units within a single Orchestration Cluster and are configured separately. One Connector Runtime can serve several Physical Tenants, each with its own client, job workers, and secrets. See [Connectors runtime: Physical Tenant support](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime).

**Info**
Support for **outbound connectors** with multiple tenants requires a dedicated
tenant job worker config (described below). **Inbound connectors** automatically work for all tenants the configured Connector Runtime client has access to. This can be configured in Admin via the application assignment.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
