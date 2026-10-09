# Red Hat OpenShift Dual-Region — Deploying Camunda 8 via Helm charts in a dual-region setup — Deploy the ECK operator and Elasticsearch clusters

Before deploying the Elasticsearch cluster, install the ECK operator and its Custom Resource Definitions (CRDs) in both clusters. The ECK operator manages the lifecycle of Elasticsearch resources in Kubernetes.

Run [deploy.sh](https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/deploy.sh) from `generic/kubernetes/operator-based/elasticsearch/`:

```bash
cd generic/kubernetes/operator-based/elasticsearch
export ELASTICSEARCH_CLUSTER_FILE="elasticsearch-cluster-dual-region.yml"
CAMUNDA_NAMESPACE=$CAMUNDA_NAMESPACE_0 KUBE_CONTEXT=$CLUSTER_0 ./deploy.sh
CAMUNDA_NAMESPACE=$CAMUNDA_NAMESPACE_1 KUBE_CONTEXT=$CLUSTER_1 ./deploy.sh
cd -
```

This performs the following actions:

- Installs the ECK CRDs.
- Deploys the operator to the `elastic-system` namespace.
- Waits for operator readiness.
- Creates the Elasticsearch cluster in both regions using the ECK operator.

Review the Elasticsearch deploy.sh script

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/deploy.sh
```

The dual-region Elasticsearch cluster manifest is located at `generic/kubernetes/operator-based/elasticsearch/elasticsearch-cluster-dual-region.yml`.

Review the Elasticsearch cluster configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/elasticsearch/elasticsearch-cluster-dual-region.yml
```

For more details on the ECK operator deployment, see the [operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#elasticsearch-deployment).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
