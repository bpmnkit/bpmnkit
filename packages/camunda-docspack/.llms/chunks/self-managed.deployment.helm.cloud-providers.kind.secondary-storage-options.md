# Deploy Camunda 8 to a local kind cluster — Secondary storage options

In addition to the deployment mode, you must choose a [secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) backend. The `SECONDARY_STORAGE` environment variable controls which backend the deployment scripts use. You must set it explicitly before running any deployment command — there is no default.

For production backend trade-offs between Elasticsearch/OpenSearch and RDBMS, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture). This kind guide is for local development and testing only.

| Value           | Operators deployed                    | Components                                                  |
| --------------- | ------------------------------------- | ----------------------------------------------------------- |
| `elasticsearch` | ECK, CloudNativePG, Keycloak Operator | Full platform including Optimize                            |
| `postgres`      | CloudNativePG, Keycloak Operator      | All components except Optimize (uses PostgreSQL RDBMS mode) |

The `postgres` option uses [RDBMS secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) (available since 8.9), which replaces Elasticsearch with PostgreSQL for Operate, Tasklist, and the Orchestration Cluster REST API. This results in a lighter deployment with fewer operators and lower resource consumption. Optimize is not available in this mode because it depends on Elasticsearch's aggregation API for analytics — this is an architectural constraint, not a temporary gap.

Once you've chosen your backend, export the variable so all subsequent commands pick it up automatically:

```bash
export SECONDARY_STORAGE=postgres   # or: elasticsearch
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
