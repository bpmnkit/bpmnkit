# Set up the Helm chart with an external Microsoft Entra tenant — Prerequisites

Before you begin, ensure you have:

- Access to a Microsoft Entra tenant with permission to create applications and app registrations
- The ID of your tenant
- An understanding of the structure and claims of access tokens in Entra
- When you connect Management Identity to an OIDC provider, you need a database regardless of feature flags. Chart `15.x` no longer bundles one, so provision it with the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment) or a managed database and connect it through `identity.externalDatabase`, as shown in the examples below. See also [use external PostgreSQL](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-existing-postgres).

If your Entra issuer presents a certificate signed by a private or internal certificate authority, Camunda components don't trust certificates signed by that CA by default.

Configure [TLS trust](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls#external-oidc-issuer-with-private-ca) to avoid `PKIX path building failed` errors when components connect to the issuer.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
