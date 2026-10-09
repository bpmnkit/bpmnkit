# Authentication

Configure how Camunda Hub authenticates users, and connect Camunda Hub to an OIDC provider other than Keycloak.

Camunda Hub authenticates users with OpenID Connect (OIDC), using the same configuration settings as the Orchestration Cluster.


## Authentication and user management

In 8.10, Camunda Hub authenticates users with the same `camunda.security.*` settings as the Orchestration Cluster, while Management Identity keeps managing users and their access. For how the responsibilities are split, see [management and modeling component authentication](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components#authentication-and-user-management).

Management Identity is still required for Camunda Hub in 8.10. For more information, see [manage access and permissions](https://docs.camunda.io/docs/next/self-managed/components/management-identity/access-management/access-management-overview).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/identity
