# Deploy multiple Optimize instances with Helm — Verify process data and index isolation

Both Optimize instances read the same `zeebe-record` indices produced by the Orchestration Cluster. The 8.10 chart automatically enables the legacy Zeebe exporter when Optimize and its Elasticsearch or OpenSearch connection are enabled. This pattern applies to single-region deployments only — [dual-region deployments don't support Optimize](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region#limitations).

1. Deploy a test process to the shared Orchestration Cluster.
1. Start and complete at least one process instance.
1. Open both Optimize URLs and confirm the process is available in each instance after import completes.
1. Query the shared datastore and confirm each Optimize instance writes its own indices.

For an unauthenticated in-cluster Elasticsearch test service, port-forward the service:

```bash
kubectl port-forward --namespace "$NAMESPACE" service/elasticsearch-master 9200:9200
```

In another terminal, list the source and Optimize-owned indices:

```bash
curl --fail --silent 'http://localhost:9200/_cat/indices?h=index&s=index' \
  | grep -E '^(zeebe-record|optimize-team-a|optimize-team-b)'
```

The result must include the shared `zeebe-record` source indices and two non-overlapping Optimize index families. Use the authentication and TLS options required by your datastore instead of the unauthenticated port-forward example in production.

The `CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX` values isolate Optimize-owned indices only. They don't filter the process records each Optimize imports. For all index-prefix rules and the OpenSearch equivalent, see [configure Elasticsearch and OpenSearch index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices#optimize-specific-configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
