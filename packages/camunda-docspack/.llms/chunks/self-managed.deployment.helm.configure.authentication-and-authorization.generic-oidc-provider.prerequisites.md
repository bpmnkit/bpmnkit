# Connect Camunda to any OIDC provider — Prerequisites

Before you begin, ensure you have:

- An OIDC-compliant provider already deployed and accessible.
- Administrative access to create and configure OIDC clients in your provider.
- Access to your provider's discovery document to obtain endpoint URLs.
- A Kubernetes cluster with a [supported Helm CLI version](https://docs.camunda.io/docs/next/reference/supported-environments#clients) installed.
- kubectl configured to access your cluster.
- When you connect Management Identity to an OIDC provider, you need a database regardless of feature flags. Chart `15.x` no longer bundles one, so provision it with the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment) or a managed database and connect it through `identity.externalDatabase`, as shown in the examples below. See also [use external PostgreSQL](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-existing-postgres).

This guide assumes your OIDC provider is already operational. It does not cover provider installation or basic OIDC configuration.

**Tip: Private or internal CA**
If your provider presents a certificate signed by a private or internal certificate authority (common with Entra hybrid setups, Okta on-premises, or an internal Keycloak), Camunda components won't trust it by default. Configure [TLS trust](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls#external-oidc-issuer-with-private-ca) to avoid `PKIX path building failed` errors when components connect to the issuer.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
