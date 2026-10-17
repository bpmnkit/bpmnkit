# RDBMS example deployment for Camunda with Helm — Configuration reference

For detailed configuration options, see:

- [Configure RDBMS in Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms): All Helm values, bundled vs. custom drivers, schema management, and troubleshooting.
- [Production installation best practices](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index): Network policies, TLS, OIDC, and multi-namespace setup.
- [Helm chart parameters](https://docs.camunda.io/docs/next/self-managed/deployment/helm/chart-parameters): Full Helm chart reference.


## Important: Component storage requirements

**Optimize requires Elasticsearch or OpenSearch, not RDBMS.** If you deploy Optimize, configure it with Elasticsearch or OpenSearch and enable the corresponding exporter for Zeebe, even if your Orchestration Cluster uses RDBMS:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: rdbms # Orchestration uses RDBMS

optimize:
  enabled: true
  database:
    elasticsearch:
      enabled: true
      external: true
      url:
        protocol: https
        host: elastic.example.com
        port: 443
```

For OpenSearch, set `optimize.database.opensearch` instead. See [use external OpenSearch for Optimize with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-opensearch).

Mixing storage types (RDBMS for Orchestration, Elasticsearch/OpenSearch for Optimize) is supported and tested.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
