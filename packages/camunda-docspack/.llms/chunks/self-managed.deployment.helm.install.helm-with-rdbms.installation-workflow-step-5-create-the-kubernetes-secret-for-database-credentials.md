# RDBMS example deployment for Camunda with Helm — Installation workflow — Step 5: Create the Kubernetes secret for database credentials

```bash
kubectl create namespace camunda
kubectl create secret generic camunda-db-secret \
  --from-literal=db-password='your-secure-password' \
  -n camunda
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
