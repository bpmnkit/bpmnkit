# Enable or disable variable import — Optimize configuration

Variable import is controlled using the `CAMUNDA_OPTIMIZE_ZEEBE_VARIABLE_IMPORT_ENABLED=true|false` environment variable.

### Configuration options

| Value   | Behavior                                     | Recommended use case                                     |
| ------- | -------------------------------------------- | -------------------------------------------------------- |
| `true`  | Variables are imported and indexed (default) | Standard deployments requiring complete business context |
| `false` | Variable import is disabled                  | High-throughput or performance-optimized environments    |

**Note**
Disabling variable import means variable-based reports and filters will no longer be available in the Optimize interface. Ensure this setting aligns with your reporting and monitoring needs before applying the configuration.

**Note**
When re-enabled, partial or full variable import may happen depending on your cluster [retention](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter#retention) configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/variable-import
