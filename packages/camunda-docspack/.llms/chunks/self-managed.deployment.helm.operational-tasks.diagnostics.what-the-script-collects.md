# Helm chart diagnostics — What the script collects

The script outputs the following data from your namespace and creates a zip file containing the following:

- **Pod Information**: Current and previous logs and full pod descriptions.
- **Cluster Events**: Sorted by time to help identify recent issues.
- **Storage Details**: PV and PVC descriptions.
- **Cluster Nodes**: Node descriptions.
- **Network Resources**: Services, endpoints, and ingresses.
- **Configuration**: Config map information.
- **Actuator endpoints**: Read-only Zeebe and Spring Boot actuator outputs from Camunda pods (partition status, cluster topology, exporters, flow control, job streams, backup state, Prometheus metrics, and configuration properties).
- **Elasticsearch/OpenSearch Data** (when an Elasticsearch or OpenSearch pod is deployed in the same namespace):
  - Cluster health, node stats, and allocation details.
  - Index list (sorted by name), aliases, shards, and segments.
  - Index templates, component templates, and lifecycle policies (ILM for Elasticsearch, ISM for OpenSearch).
  - Camunda import position documents for Optimize.
  - Operate post-importer queue document count (and a sample of entries when `--export-post-importer-queue` is set).
  - Zeebe exporter index statistics: document counts and min/max sequence numbers per value type and partition.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/diagnostics
