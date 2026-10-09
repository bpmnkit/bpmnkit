# App Integrations and Physical Tenants — Known limitations

- A separate identity provider per Physical Tenant ([Model C](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization#model-c-multiple-idps-advanced)) is not supported.
- Identity linking and sign-in are deployment-wide, not per tenant.
- Cluster health and version are reported per cluster, not per Physical Tenant.
- Physical Tenants are a Self-Managed feature; App Integrations on SaaS is single-tenant.

[Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations
