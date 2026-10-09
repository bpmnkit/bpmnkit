# Upgrade Camunda components from 8.9 to 8.10 — Physical Tenants — Not supported

There is no migration path from Logical Tenants to Physical Tenants. The two are independent mechanisms, and a Logical Tenant cannot be promoted to or moved into a Physical Tenant. Logical Tenants remain available inside each Physical Tenant as a lightweight subdivision.

Downgrading from 8.10 back to 8.9 is not supported. This is a general Camunda constraint rather than a Physical Tenants one, so there is no rollback path for the cluster and no return path for `camunda.physical-tenants.default.*` overrides. Take a backup before you upgrade, and rehearse the upgrade in a non-production cluster first.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
