# Authentication and authorization for Physical Tenants — Identity deployment models

Physical Tenants support two recommended identity deployment models. A third model for advanced or managed-service scenarios is available but not recommended as a baseline.

### Model A: Single IdP, single client

All Physical Tenants use one identity provider and one client registration. Roles and permissions are differentiated within that client by tenant-specific mapping rules.

Use Model A when:

- You have one organization or team using a single IdP.
- You want simple configuration with a single client.
- Role differentiation per tenant is handled through token claims or group mappings in Camunda.

### Model B: Single IdP, multiple role-level clients

All Physical Tenants use one identity provider, but each tenant (or role level) has a dedicated client registration. Camunda distinguishes clients by matching both the **issuer** (`iss` claim) to identify the IdP and the **audience** (`aud` claim) to identify the specific role-level client.

Use Model B when:

- You need stricter per-tenant token isolation.
- Different teams or departments require separate client configurations.
- You want role-level client separation within one IdP.

Model B is the recommended baseline for most customers deploying Physical Tenants.

### Model C: Multiple IdPs (advanced)

Each Physical Tenant uses a separate identity provider. This model is intended for managed services or advanced deployments where tenants are fully autonomous organizations with their own IdPs.

Model C is not a recommended baseline. Use it only when:

- Tenants are separate organizations that each manage their own IdP.
- You are operating a managed service where per-tenant IdP autonomy is required.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization
