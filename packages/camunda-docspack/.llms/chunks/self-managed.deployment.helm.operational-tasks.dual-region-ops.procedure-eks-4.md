# Helm chart dual-region operational procedure — Procedure — EKS

Assuming based on **Step 1** and **Step 2**, the base Helm values file `camunda-values.yml` in `aws/kubernetes/eks-dual-region/helm-values` includes the adjustments for Elasticsearch and the Zeebe initial brokers.

Make sure to remove the `CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA` variable from `camunda-values.yml`.

Edit the `camunda-values.yml` in `aws/kubernetes/eks-dual-region/helm-values` and remove the following from the `orchestration.env`:

```yaml
orchestration:
  env:
    - name: CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA
      value: "false"
  # ...
```

1. Upgrade the Camunda environment in the surviving region (`CAMUNDA_NAMESPACE_SURVIVING` and `REGION_SURVIVING`) to deploy Operate and Tasklist:

   ```bash
   helm upgrade $CAMUNDA_RELEASE_NAME camunda/camunda-platform \
   --version $HELM_CHART_VERSION \
   --kube-context $CLUSTER_SURVIVING \
   --namespace $CAMUNDA_NAMESPACE_SURVIVING \
   -f camunda-values.yml \
   -f ../../../../generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml \
   -f $REGION_SURVIVING/camunda-values.yml
   ```

2. Upgrade the environment in new region (`CAMUNDA_NAMESPACE_RECREATED` and `REGION_RECREATED`) to deploy Operate and Tasklist:

   ```bash
   helm upgrade $CAMUNDA_RELEASE_NAME camunda/camunda-platform \
   --version $HELM_CHART_VERSION \
   --kube-context $CLUSTER_RECREATED \
   --namespace $CAMUNDA_NAMESPACE_RECREATED \
   -f camunda-values.yml \
   -f ../../../../generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml \
   -f $REGION_RECREATED/camunda-values.yml
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
