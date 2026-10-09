# Physical Tenant isolation model — What is not isolated

- Gateways are shared between tenants, so a saturated gateway can still affect multiple tenants.
- Brokers are co-located and shared infrastructure remains part of the deployment.
- Full performance isolation is out of scope for the first version.
- Future versions may reduce sharing further, for example through more isolated actor-thread or runtime placement, but that is not part of 8.10.


## Storage validation

Camunda validates storage configuration at startup. If two tenants resolve to the same backend location, startup fails and the error names the conflicting tenants. For document stores, uniqueness is validated against the resolved provider, bucket or container, and path tuple.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index
