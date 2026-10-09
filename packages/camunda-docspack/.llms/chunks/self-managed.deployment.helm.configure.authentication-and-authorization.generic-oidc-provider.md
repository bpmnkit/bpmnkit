# Connect Camunda to any OIDC provider

Learn how to configure Camunda 8 Self-Managed to use any OIDC-compliant identity provider for authentication.

This guide shows you how to configure Camunda 8 Self-Managed to authenticate with any OpenID connect (OIDC)-compliant identity provider.

**Info: Bitnami subcharts removed in Camunda 8.10**
Earlier releases bundled PostgreSQL through Bitnami subcharts (`identityPostgresql`, `webModelerPostgresql`). As of Camunda 8.10 (Helm chart `15.x`), the bundled Bitnami subcharts are removed: provide PostgreSQL with the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment) or a managed database, as shown in the examples below.

**Info**
Before proceeding, since this is a general guide, refer to [External OIDC provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-oidc-provider) to see the available provider-specific guides, as they include detailed setup instructions tailored to provider's interface.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
