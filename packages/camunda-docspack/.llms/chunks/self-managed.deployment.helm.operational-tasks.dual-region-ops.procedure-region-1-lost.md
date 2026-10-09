# Helm chart dual-region operational procedure — Procedure — region-1-lost

```bash
export CLUSTER_SURVIVING=$CLUSTER_0
export CLUSTER_RECREATED=$CLUSTER_1
export CAMUNDA_NAMESPACE_SURVIVING=$CAMUNDA_NAMESPACE_0
export CAMUNDA_NAMESPACE_RECREATED=$CAMUNDA_NAMESPACE_1
export REGION_SURVIVING=region0
export REGION_RECREATED=region1

echo "You have lost $CLUSTER_RECREATED, $CLUSTER_SURVIVING is still alive"
```

  

The `camunda-zeebe-x` pod represents the new architecture that contains the Orchestration Cluster and its components. It includes the former Zeebe Gateway, Operate, Tasklist, the new embedded Admin, and the new Camunda Exporter.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
