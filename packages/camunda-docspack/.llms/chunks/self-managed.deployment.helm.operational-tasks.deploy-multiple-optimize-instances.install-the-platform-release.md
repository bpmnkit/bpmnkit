# Deploy multiple Optimize instances with Helm — Install the platform release

Install the platform release before the Optimize-only release so Management Identity can create the second client.

```bash
export NAMESPACE=camunda
export CAMUNDA_HOST=camunda.example.com

helm repo add camunda https://helm.camunda.io
helm repo update

helm install platform camunda/camunda-platform \
  --namespace "$NAMESPACE" \
  --version "$CHART_VERSION" \
  --values values-production.yaml \
  --values values-platform.yaml \
  --wait
```

The last values file takes precedence. Confirm that your production values don't override the client IDs, context paths, shared service endpoints, or index prefixes from `values-platform.yaml`.

Check the release and its services:

```bash
helm status platform --namespace "$NAMESPACE"
kubectl get pods,services,ingresses --namespace "$NAMESPACE" \
  --selector app.kubernetes.io/instance=platform
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
