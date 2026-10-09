# Use external Elasticsearch for Orchestration Cluster with Helm

Configure the Orchestration Cluster in Camunda 8 Self-Managed to use an external Elasticsearch instance when deploying with Helm.

Configure the Orchestration Cluster in Camunda 8 Self-Managed to connect to an external Elasticsearch instance as a secondary storage backend. Elasticsearch is used for indexing and querying operational data consumed by Orchestration Cluster applications and APIs. For a canonical definition, see [Elasticsearch/OpenSearch](https://docs.camunda.io/docs/next/reference/glossary#elasticsearchopensearch).

Starting with Camunda 8.9, the Helm chart no longer provisions Elasticsearch by default. To use Elasticsearch as secondary storage for the Orchestration Cluster, explicitly configure it in your Helm values under `orchestration.data.secondaryStorage.elasticsearch`. You can either deploy Elasticsearch using the [ECK operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#elasticsearch-deployment) (recommended) or connect Camunda to an existing external Elasticsearch instance, either running inside the same Kubernetes cluster or outside it.

This page applies to the Orchestration Cluster only. If you also deploy Optimize, configure Optimize separately using [use external Elasticsearch for Optimize with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-elasticsearch).

**Note**
The bundled Elasticsearch Bitnami subchart is removed starting with chart 15.x (Camunda 8.10); `elasticsearch.enabled` no longer exists. Use the [ECK (Elastic Cloud on Kubernetes) operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#elasticsearch-deployment) or a managed Elasticsearch service instead. See [deploy required dependencies with Kubernetes operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure) for details.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch
