# OpenSearch exporter — Configuration

**Note**
As the exporter is packaged with Zeebe, it is not necessary to specify a `jarPath`.

The exporter can be enabled by configuring it with the classpath in the broker settings.

For a Spring Boot application or Camunda 8 with unified configuration:

**Application config (YAML):**

```yaml
camunda:
  data:
    exporters:
      opensearch:
        className: io.camunda.zeebe.exporter.opensearch.OpensearchExporter
        args:
        # Refer to the table below for the available args options
```

**Environment variables:**

Set environment variables in the format `CAMUNDA_DATA_EXPORTERS_OPENSEARCH_...` (for example, `CAMUNDA_DATA_EXPORTERS_OPENSEARCH_URL`).

**Helm:**

Add the same configuration under `orchestration.configuration` in your `values.yaml` file.

**Warning**
Do not configure both legacy (`zeebe.broker.exporters.*`) and unified (`camunda.data.exporters.*`) exporter properties at the same time. Exporter properties are a breaking-change mapping in unified configuration, and the application fails to start until legacy properties are removed.

The exporter can be configured by providing `args`. The table below explains all the different options, and the default values for these options:

| Option                  | Description                                                                                                                                                                                      | Default                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| url                     | Valid URLs as a comma-separated string.                                                                                                                                                          | `http://localhost:9200` |
| request-timeout-ms      | Request timeout (in ms) for the OpenSearch client.                                                                                                                                               | `30000`                 |
| index                   | Refer to [index](#index) for index configuration options, including record/value-type switches, Optimize-focused filters, and the Optimize mode flag.                                            |                         |
| bulk                    | Refer to [bulk](#bulk) for the bulk configuration options.                                                                                                                                       |                         |
| retention               | Refer to [retention](#retention) for the retention configuration options.                                                                                                                        |                         |
| authentication          | Refer to [authentication](#authentication) for the authentication configuration options.                                                                                                         |                         |
| aws                     | Refer to [AWS](#aws) for the AWS configuration options.                                                                                                                                          |                         |
| include-enabled-records | If `true`, exports all enabled record types configured under `index`. If `optimize-mode-enabled` is `true`, Optimize mode takes precedence. Use mainly for migration or compatibility scenarios. | `false`                 |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter
