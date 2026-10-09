# Configure Physical Tenants across releases — Isolate every index prefix family

Authentication doesn't isolate shared Elasticsearch or OpenSearch storage. Assign unique prefixes for every cluster and tenant.

| Prefix family                     | Configuration                                                                                                                                                     | Requirement                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Orchestration application indices | Default: `orchestration.index.prefix`. Physical Tenant: `camunda.physical-tenants.<id>.data.secondary-storage.<backend>.index-prefix`                             | Unique per cluster and tenant                                       |
| Legacy exporter writer            | Default: `orchestration.exporters.zeebe.index.prefix`, or the exporter assigned to an explicit `default` entry. Physical Tenant: its exporter `args.index.prefix` | Unique per cluster and tenant                                       |
| Optimize reader                   | `optimize.database.elasticsearch.prefix` or `optimize.database.opensearch.prefix`                                                                                 | Must exactly equal that tenant's Legacy exporter writer prefix      |
| Optimize application indices      | `CAMUNDA_OPTIMIZE_ELASTICSEARCH_SETTINGS_INDEX_PREFIX` or `CAMUNDA_OPTIMIZE_OPENSEARCH_SETTINGS_INDEX_PREFIX` in `optimize.env`                                   | Unique per Optimize release, and different from every writer prefix |

Two failure modes follow from getting this wrong, and neither announces itself:

- **Reusing a prefix** mixes one cluster's or tenant's records into another's Operate, Tasklist, or Optimize data.
- **A writer and reader mismatch** starts Optimize against the wrong or an empty record set. Similar-looking prefixes are not sufficient; the values must be equal.

See [configure Elasticsearch and OpenSearch index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants
