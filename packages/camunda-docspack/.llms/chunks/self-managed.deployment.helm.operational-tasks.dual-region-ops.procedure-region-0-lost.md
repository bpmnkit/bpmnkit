# Helm chart dual-region operational procedure — Procedure — region-0-lost

```bash
export CLUSTER_SURVIVING=$CLUSTER_1
export CLUSTER_RECREATED=$CLUSTER_0
export CAMUNDA_NAMESPACE_SURVIVING=$CAMUNDA_NAMESPACE_1
export CAMUNDA_NAMESPACE_RECREATED=$CAMUNDA_NAMESPACE_0
export REGION_SURVIVING=region1
export REGION_RECREATED=region0

echo "You have lost $CLUSTER_RECREATED, $CLUSTER_SURVIVING is still alive"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
