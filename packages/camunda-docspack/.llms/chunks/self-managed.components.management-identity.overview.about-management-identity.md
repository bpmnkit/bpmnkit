# Management Identity — About Management Identity

Management Identity is included in the full and standalone Camunda Hub [Docker Compose configurations](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration#choose-a-docker-compose-configuration) and in the default [Helm chart deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install). These configurations use the packaged Keycloak instance as an identity provider (IdP). The lightweight Docker Compose configuration uses Orchestration Cluster Admin and does not start Management Identity or Keycloak.

- Administrators can use Management Identity to manage Camunda 8 users, groups, roles, permissions, and applications.
- Users (interacting via Camunda web components) and applications (interacting via Camunda APIs, such as job workers) are supported, using secure authorization based on OAuth 2.0 standards.
- Users log in to web components via an IdP login page. Applications authenticate via machine-to-machine (M2M) tokens.
- You can integrate Management Identity with an [external OIDC provider](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider), [connect to an existing Keycloak instance](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-existing-keycloak), or [configure an external IdP using Keycloak](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/configure-external-identity-provider).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview
