# Install an Orchestration Cluster release — Export records for Optimize

Optimize reads the records written by the legacy Elasticsearch or OpenSearch exporter, not the Orchestration Cluster's own indices. The chart renders that exporter automatically only when Optimize runs in the same release. With Optimize in its own release, the example above writes no records Optimize can read until you enable the exporter here.

If the cluster uses Elasticsearch or OpenSearch secondary storage, enable the exporter with chart values. It writes to the secondary storage endpoint:

```yaml
orchestration:
  exporters:
    zeebe:
      enabled: true
      index:
        # Must exactly equal optimize.database.elasticsearch.prefix
        # in this cluster's default-tenant Optimize release.
        prefix: production-a-default-records

optimize:
  enabled: false
  database:
    elasticsearch:
      # Required for the exporter to send the secondary storage credentials.
      external: true
```

If the cluster uses RDBMS secondary storage, or the records must go to a different Elasticsearch or OpenSearch instance, configure the exporter directly as broker configuration:

```yaml
orchestration:
  env:
    - name: ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_AUTHENTICATION_PASSWORD
      valueFrom:
        secretKeyRef:
          name: optimize-records-store
          key: password
  extraConfiguration:
    - file: optimize-exporter.yaml
      content: |
        zeebe:
          broker:
            exporters:
              elasticsearch:
                className: io.camunda.zeebe.exporter.ElasticsearchExporter
                args:
                  url: https://elasticsearch.example.com:9200
                  authentication:
                    username: camunda
                  index:
                    prefix: production-a-default-records
```

For OpenSearch, use the `opensearch` exporter with `io.camunda.zeebe.exporter.opensearch.OpensearchExporter`. The Orchestration Cluster keeps using its own secondary storage; the exporter writes the separate record stream Optimize reads. Every prefix must be unique per cluster and tenant. See [isolate every index prefix family](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants#isolate-every-index-prefix-family).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release
