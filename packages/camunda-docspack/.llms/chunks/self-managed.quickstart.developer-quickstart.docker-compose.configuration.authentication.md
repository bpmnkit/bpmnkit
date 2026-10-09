# Configure Docker Compose environments — Authentication

**Note**
By default, the lightweight configuration uses [Basic authentication for the Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster#basic-authentication). The full configuration uses Keycloak for [Management Identity authentication](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components).

### Lightweight configuration

- **Web UI:** Log in to Operate and Tasklist with `demo` / `demo`.
- **APIs:** REST and gRPC APIs are publicly accessible by default.

### Full configuration

- **Web UI:** Log in to Operate, Tasklist, Optimize, and Camunda Hub with `demo` / `demo`.
- **APIs:** REST and gRPC APIs require OAuth with the following settings:
  - **Client ID:** `orchestration`
  - **Client secret:** `secret`
  - **OAuth URL:** `http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token`
  - **Audience:** `orchestration-api`

For details, see [Orchestration Cluster REST API authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration
