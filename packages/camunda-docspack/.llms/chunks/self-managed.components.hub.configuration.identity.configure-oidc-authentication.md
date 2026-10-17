# Authentication — Configure OIDC authentication

Configure Camunda Hub's OIDC authentication with the properties documented under [Identity / Keycloak](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#identity--keycloak), not with the Orchestration Cluster's `camunda.security.authentication.oidc.*` settings. For the one exception, the username claim, see the same section.


## Use a different OIDC provider than Keycloak

For deployments that include Keycloak, Camunda Hub uses it as its identity provider by default. For installation methods that start Keycloak, see [About Management Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview#about-management-identity). To use a different OIDC provider, follow the steps in the [OIDC connection guide](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity
