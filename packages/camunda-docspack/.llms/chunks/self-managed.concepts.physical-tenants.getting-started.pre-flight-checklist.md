# Set up two isolated Physical Tenants — Pre-flight checklist

Confirm each of these before you start. Every item here has caused a real setup failure:

| Check                                                                                       | Why it matters                                                                                                                                                                     |
| :------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Running Camunda 8.10 Self-Managed Helm deployment                                           | Physical Tenants are a Self-Managed feature only, not available on SaaS in this release.                                                                                           |
| RDBMS (or Elasticsearch/OpenSearch) reachable for a second, distinct schema or index prefix | Startup fails if the new tenant's storage location collides with an existing one.                                                                                                  |
| Permission to register a new redirect URI in your identity provider                         | The new tenant needs its own callback URI registered before its first browser login.                                                                                               |
| Decide whether the new tenant uses the same identity provider as `default`                  | Both tenants can share one OIDC provider and still authorize independently. See [choose an identity provider setup](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization#identity-deployment-models). |

Two behaviors that are easy to miss on a first rollout

- **Table and index prefixes are compared case-insensitively.** Configuring `riskprod_` for one tenant and `RISKPROD_` for another is treated as the same storage location and fails startup, not two distinct ones. Pick prefixes that are unique regardless of case.
- **Elasticsearch, OpenSearch, and custom exporters need explicit per-tenant assignment.** Only the built-in Camunda exporter and the RDBMS exporter merge their configuration from the root automatically, based on the tenant's configured secondary storage type. The Elasticsearch and OpenSearch exporters are treated as custom exporters: like any custom exporter loaded from a JAR, they need a full configuration block per tenant, and that tenant must list them under its own exporter assignment configuration rather than inheriting from the root. If your secondary storage is RDBMS and you don't use any custom exporters, skip this.

Deploying from Desktop Modeler?

To target a Physical Tenant from Desktop Modeler, change the cluster URL from `.../v2` to `.../physical-tenants/<physicalTenantId>/v2` and leave the client's tenant ID field unset. That field is for Logical Tenants, not Physical Tenants.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
