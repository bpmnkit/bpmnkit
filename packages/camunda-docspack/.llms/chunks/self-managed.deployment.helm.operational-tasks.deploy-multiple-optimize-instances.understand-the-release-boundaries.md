# Deploy multiple Optimize instances with Helm — Understand the release boundaries

Camunda 8.10 doesn't bundle Elasticsearch, OpenSearch, Keycloak, or PostgreSQL in the Camunda chart. Deploy and manage these dependencies separately.

| Boundary                    | Platform release (`platform`)       | Optimize-only release (`optimize-team-b`)   |
| --------------------------- | ----------------------------------- | ------------------------------------------- |
| Orchestration Cluster       | Runs                                | Doesn't run                                 |
| Management Identity         | Runs as service `platform-identity` | Uses `http://platform-identity:80/identity` |
| Optimize                    | Runs at `/optimize-team-a`          | Runs at `/optimize-team-b`                  |
| Elasticsearch or OpenSearch | Uses the external shared service    | Uses the same external shared service       |
| Keycloak or OIDC provider   | Uses the external shared provider   | Uses the same provider and realm            |
| OIDC client                 | `optimize-team-a`                   | `optimize-team-b`                           |
| Optimize-owned indices      | Prefix `optimize-team-a`            | Prefix `optimize-team-b`                    |
| Other Camunda components    | Run                                 | Explicitly disabled                         |

Both releases must use the same Camunda 8.10 chart and application version. Install them in the same namespace when you use the service names and shared Kubernetes Secrets shown in this guide.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
