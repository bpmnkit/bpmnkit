# Configure data retention — References

**Related Camunda documentation:**

- [Configure Helm chart components](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs) – How to use `orchestration.configuration` for advanced settings
- [Upgrade from 8.9 to 8.10](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100) – Version upgrade guidance
- [Zeebe Elasticsearch exporter retention](https://docs.camunda.io/docs/next/self-managed/deployment/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter.md?configuration=retention#retention) – Legacy Zeebe exporter retention settings
- [Zeebe Camunda exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter) – Camunda exporter configuration (controls `orchestration.history.*` settings)
- [History archiving settings](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter#history) – Archiving and rollover configuration
- [Retention settings](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter#retention) – Historical data retention policies
- [Camunda 8 system configuration (Optimize)](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8) – Optimize import and retention behavior and version support
- [Operate data retention](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/data-retention) – Operate-specific retention behavior
- [Tasklist data retention](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/data-retention) – Tasklist-specific retention behavior

**External documentation:**

- [Elasticsearch ILM documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html) - Official Elasticsearch ILM guide
- [Elasticsearch TimeUnit format](https://www.elastic.co/guide/en/elasticsearch/reference/current/api-conventions.html#time-units) - Valid time unit values
- [OpenSearch ISM documentation](https://opensearch.org/docs/latest/im-plugin/ism/index/) - Official OpenSearch ISM guide
- [Helm values documentation](https://helm.sh/docs/chart_template_guide/values_files/) - Working with Helm values files

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention
