# Install an Optimize release — Give each release its own identity

Every Optimize release needs its own OIDC client ID, audience, role name, redirect URL, and secret, and the same values must appear in that tenant's record in the Hub release.

Setting a dedicated `roleName` in the Hub cluster record avoids adding this tenant's audience to the shared `Optimize` role, which would grant access across tenants.

**Warning**
You can point several tenants at one shared audience. Those instances are then separated by client identity only, not by authorization. Neither separate credentials nor separate index prefixes make this arrangement authorization isolation.

Distinct `roleName` values keep the Optimize role isolated per tenant, but Optimize's logical tenants are a separate mechanism with their own cross-tenant caveat. See [Optimize and Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/optimize#known-limitation-logical-tenants-with-the-same-id-across-physical-tenants) if you reuse the same logical tenant ID across Physical Tenants.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release
