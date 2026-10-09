# RDBMS example deployment for Camunda with Helm — Installation workflow — Step 7: Install Camunda

```bash
helm install camunda camunda/camunda-platform \
  --namespace camunda \
  -f values-rdbms.yaml
```

Monitor the installation:

```bash
kubectl get pods -n camunda
kubectl logs -n camunda -l app.kubernetes.io/name=orchestration --tail=50
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
