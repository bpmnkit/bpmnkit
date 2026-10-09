# Helm chart dual-region operational procedure — Procedure — EKS

This procedure requires your Helm values file, `camunda-values.yml`, in `aws/kubernetes/eks-dual-region/helm-values`, used to deploy EKS Dual-region Camunda clusters.

Ensure the values for `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION0_ARGS_CONNECT_URL` and `CAMUNDA_DATA_EXPORTERS_CAMUNDAREGION1_ARGS_CONNECT_URL` correctly point to their respective regions. The placeholder in `CAMUNDA_CLUSTER_INITIALCONTACTPOINTS` should contain the Zeebe endpoints for both regions, the result of the `aws/kubernetes/eks-dual-region/procedure/generate_zeebe_helm_values.sh`.

This step is equivalent to applying for the region to be recreated:

- [Setting up the Camunda 8 Dual-Region Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region#camunda-8-helm-chart-prerequisites)
- [Deploying the Camunda 8 Dual-Region Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region#install-camunda-8-using-helm)

**Important**
The standalone Schema Manager must be disabled; otherwise, it will prevent a successful restore of the Elasticsearch backup later on. If you forget to disable it, you must manually remove all created indices in Elasticsearch in the restored region before restoring the backup.

There is no Helm chart option for this setting. Because `orchestration.env` is an array, it cannot be overwritten through an overlay and must be added manually on a temporary basis.

Edit `camunda-values.yml` in `aws/kubernetes/eks-dual-region/helm-values` to include the following under `orchestration.env`:

```yaml
orchestration:
  env:
    - name: CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA
      value: "false"
  # ...
```

##### Deploy prerequisite services

Before installing Camunda via Helm, you must redeploy the ECK-managed Elasticsearch cluster and synchronize cross-region passwords. Without this, the Helm install will fail because there is no Elasticsearch to connect to.

1. From `generic/kubernetes/operator-based/elasticsearch`, deploy the ECK operator and Elasticsearch cluster in the recreated region:

   ```shell
   cd generic/kubernetes/operator-based/elasticsearch
   export ELASTICSEARCH_CLUSTER_FILE="elasticsearch-cluster-dual-region.yml"
   KUBE_CONTEXT=$CLUSTER_RECREATED ./deploy.sh
   cd -
   ```

2. Wait for Elasticsearch to become ready. Verify the cluster health is `green` before proceeding:

   ```shell
   kubectl get elasticsearch --context $CLUSTER_RECREATED --namespace $CAMUNDA_NAMESPACE_RECREATED
   ```

3. From `aws/kubernetes/eks-dual-region/procedure`, resynchronize the Elasticsearch passwords across regions:

   ```shell
   cd aws/kubernetes/eks-dual-region/procedure
   ./sync_elasticsearch_passwords.sh
   cd -
   ```

   This recreates the cross-region password secrets (`elasticsearch-es-password-region-0` and `elasticsearch-es-password-region-1`) required by the Zeebe exporter configuration.

For more details on these steps, see [Deploy the ECK operator and Elasticsearch clusters](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region#deploy-the-eck-operator-and-elasticsearch-clusters) and [Synchronize Elasticsearch passwords across regions](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region#synchronize-elasticsearch-passwords-across-regions).

##### Install Camunda using Helm

From the terminal context of `aws/kubernetes/eks-dual-region/helm-values` execute:

```bash
helm install $CAMUNDA_RELEASE_NAME camunda/camunda-platform \
  --version $HELM_CHART_VERSION \
  --kube-context $CLUSTER_RECREATED \
  --namespace $CAMUNDA_NAMESPACE_RECREATED \
  -f camunda-values.yml \
  -f ../../../../generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml \
  -f $REGION_RECREATED/camunda-values.yml \
  --set orchestration.profiles.operate=false \
  --set orchestration.profiles.tasklist=false
```

After successfully applying the recreated region, remove the temporary `CAMUNDA_DATABASE_SCHEMAMANAGER_CREATESCHEMA` environment variable.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
