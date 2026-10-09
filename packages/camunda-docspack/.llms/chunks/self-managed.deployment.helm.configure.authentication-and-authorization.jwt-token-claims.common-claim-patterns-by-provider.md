# JWT token claims reference — Common claim patterns by provider

| Provider        | User claim                      | Client claim         | Audience default                            |
| --------------- | ------------------------------- | -------------------- | ------------------------------------------- |
| Microsoft Entra | `preferred_username`            | `azp`                | Client ID                                   |
| Keycloak        | `email` or `preferred_username` | `azp` or `client_id` | May require configuration                   |
| Auth0           | `email`                         | `client_id`          | Client ID                                   |
| Okta            | `email`                         | `client_id`          | Client ID                                   |
| PingFederate    | `sub`                           | `client_id`          | Shared Access Token Manager for all clients |
| PingOne         | `sub`                           | `client_id`          | Per-application, via resource/scope grants  |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims
