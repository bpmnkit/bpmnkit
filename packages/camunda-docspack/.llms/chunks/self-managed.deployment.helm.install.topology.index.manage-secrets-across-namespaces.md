# Install the Camunda 8.10 deployment topology — Manage secrets across namespaces

Kubernetes Secrets are namespace-scoped. When Management Identity administers an external Keycloak, create each workload client secret in both the Hub namespace and the workload namespace with identical values. With another OIDC provider, Management Identity doesn't consume the workload client secrets, so project them only into the workload namespaces.

The following examples use these Secrets:

| Secret                   | Key                     | Required namespaces                 | Purpose                                                  |
| ------------------------ | ----------------------- | ----------------------------------- | -------------------------------------------------------- |
| `keycloak-admin`         | `password`              | `hub`                               | Keycloak administration for Management Identity          |
| `identity-first-user`    | `password`              | `hub`                               | Initial Management Identity user                         |
| `identity-database`      | `password`              | `hub`                               | Management Identity database                             |
| `hub-database`           | `password`              | `hub`                               | Camunda Hub database                                     |
| `hub-pusher`             | `app-key`, `app-secret` | `hub`                               | Stable Camunda Hub WebSocket credentials across upgrades |
| `orchestration-oidc`     | `client-secret`         | `hub`, `orchestration`              | Orchestration OIDC client                                |
| `connectors-oidc`        | `client-secret`         | `hub`, `orchestration`              | Connectors OIDC client                                   |
| `optimize-oidc`          | `client-secret`         | `hub`, Optimize namespace           | Optimize OIDC client, one per Physical Tenant            |
| `secondary-storage`      | `password`              | `orchestration`, Optimize namespace | Elasticsearch password for Orchestration and Optimize    |
| `hub-tls`                | `tls.crt`, `tls.key`    | `hub`                               | Hub Ingress TLS                                          |
| `orchestration-tls`      | `tls.crt`, `tls.key`    | `orchestration`                     | Orchestration HTTP Ingress TLS                           |
| `orchestration-grpc-tls` | `tls.crt`, `tls.key`    | `orchestration`                     | Orchestration gRPC Ingress TLS                           |

Use an external secret manager to synchronize the values. Don't store production credentials directly in a Helm values file. See [secret management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index
