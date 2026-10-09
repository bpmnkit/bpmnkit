# Configure Physical Tenants across releases — Scope and limits

- Hub topology connections and Physical Tenants require OIDC. Basic authentication isn't supported.
- The chart doesn't configure cross-cluster DNS, routing, TLS trust, firewall rules, or external identity-provider objects. Every configured URL must be reachable from the release that uses it.
- One Optimize release serves one tenant. Sharing an Optimize release between the default tenant and Physical Tenants is out of scope.
- Separate OIDC credentials don't isolate storage. Prefixes and backend access controls remain your responsibility.
- Supported cluster and tenant scale limits haven't been established. Validate your target scale before committing to it.
- There's no migration path from Logical Tenants to Physical Tenants. See [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants
