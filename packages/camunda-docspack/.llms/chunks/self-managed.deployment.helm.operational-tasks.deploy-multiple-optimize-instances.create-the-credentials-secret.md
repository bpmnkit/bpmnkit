# Deploy multiple Optimize instances with Helm — Create the credentials Secret

The reference files don't contain plaintext credentials. They read all credentials from a Secret named `multi-optimize-credentials`.

Create the following keys through your secret-management system:

| Secret key                      | Consumer                                   |
| ------------------------------- | ------------------------------------------ |
| `keycloak-admin-password`       | Management Identity setup against Keycloak |
| `identity-first-user-password`  | Initial Management Identity user           |
| `optimize-team-a-client-secret` | First Optimize OIDC client                 |
| `optimize-team-b-client-secret` | Second Optimize OIDC client                |
| `connectors-client-secret`      | Connectors OIDC client                     |
| `orchestration-client-secret`   | Orchestration Cluster OIDC client          |
| `web-modeler-pusher-app-key`    | Web Modeler web app and WebSocket service  |
| `web-modeler-pusher-app-secret` | Web Modeler REST API and WebSocket service |

The two Optimize client secrets must be different. The `optimize-team-b-client-secret` value must be identical for these two references:

- `identity.clients[].secret` in `values-platform.yaml`.
- `global.identity.auth.optimize.secret` in `values-optimize-only.yaml`.

For a disposable test environment, you can create the Secret from environment variables populated by your secret manager:

```bash
kubectl -n "$NAMESPACE" create secret generic multi-optimize-credentials \
  --from-literal=keycloak-admin-password="$KEYCLOAK_ADMIN_PASSWORD" \
  --from-literal=identity-first-user-password="$IDENTITY_FIRST_USER_PASSWORD" \
  --from-literal=optimize-team-a-client-secret="$OPTIMIZE_TEAM_A_CLIENT_SECRET" \
  --from-literal=optimize-team-b-client-secret="$OPTIMIZE_TEAM_B_CLIENT_SECRET" \
  --from-literal=connectors-client-secret="$CONNECTORS_CLIENT_SECRET" \
  --from-literal=orchestration-client-secret="$ORCHESTRATION_CLIENT_SECRET" \
  --from-literal=web-modeler-pusher-app-key="$WEB_MODELER_PUSHER_APP_KEY" \
  --from-literal=web-modeler-pusher-app-secret="$WEB_MODELER_PUSHER_APP_SECRET"
```

Don't store the environment variables or generated Secret manifest in source control.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
