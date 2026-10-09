# Helm charts secret management — Extract plaintext values and reference them as Kubernetes Secrets — Create a secret

Create one secret with your values (example: `app-credentials`):

```bash
kubectl -n "$RELEASE_NAMESPACE" create secret generic app-credentials --from-literal=some-app-client-secret="$SOME_CLIENT_SECRET" --from-literal=db-admin-password="$DB_ADMIN_PASSWORD"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management
