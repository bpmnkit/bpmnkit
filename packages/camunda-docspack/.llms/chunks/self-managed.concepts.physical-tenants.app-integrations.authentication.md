# App Integrations and Physical Tenants — Authentication

App Integrations defines **one** identity provider for the whole deployment: a single `auth.issuer` and `auth.kind`, and one M2M/SPA client pair. Tenants are distinguished by **audience**, configured per tenant under `auth.audiences.zeebe`.

This implements [Model B: single IdP, multiple role-level clients](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization#model-b-single-idp-multiple-role-level-clients). [Model C](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization#model-c-multiple-idps-advanced), a separate identity provider per Physical Tenant, is **not supported**, since App Integrations cannot hold more than one issuer.

The audience for an outbound call is resolved in this order, first match wins:

1. `clusters[].physicalTenants[].auth.audiences.zeebe`
2. `clusters[].auth.audiences.zeebe`
3. `auth.audiences.zeebe` (the deployment-wide value)

Only the resource audience can be overridden per tenant. `auth.audiences.global` and `auth.audiences.app_integrations` are deployment-wide and are rejected inside a per-cluster or per-tenant `auth` block.

**Note**
The shapes differ from the orchestration cluster's own configuration: Camunda's identity provider takes a list of allowed audiences, whereas App Integrations sends a single audience string per tenant. The value you set here must be one of the audiences the tenant's client registration accepts.

User sign-in is deployment-wide. A user links their Camunda identity once, not per Physical Tenant, so the OIDC redirect URIs registered for App Integrations are not tenant-scoped. See [IdP redirect URI registration](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization#idp-redirect-uri-registration).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations
