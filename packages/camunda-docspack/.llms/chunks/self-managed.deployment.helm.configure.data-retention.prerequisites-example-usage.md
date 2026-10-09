# Configure data retention — Prerequisites — Example usage

#### Orchestration Cluster history retention (recommended)

In most deployments starting with Camunda 8.8, you only need retention for Orchestration Cluster indices (archived Operate, Tasklist, and Camunda data).

The example below sets most properties to their current default values and explicitly enables history retention (`orchestration.history.retention.enabled: true`). If defaults change in future versions, clusters that keep these explicit values will retain the behavior shown here.

```yaml
orchestration:
  history:
    waitPeriodBeforeArchiving: 1h
    rolloverInterval: 1d
    rolloverBatchSize: 500
    archiveByIdEnabled: true
    reindexBatchSize: 2500
    elsRolloverDateFormat: date
    delayBetweenRuns: 2000
    maxDelayBetweenRuns: 60000
    retention:
      enabled: true
      minimumAge: 30d
      policyName: camunda-history-retention-policy
      usageMetricsMinimumAge: 730d
      usageMetricsPolicyName: camunda-usage-metrics-retention-policy
```

#### Zeebe records retention

Enable Zeebe records retention only if you still use the legacy Elasticsearch/OpenSearch Exporter (for example, when Optimize reads from `zeebe-record-*` indices).

Exporter configuration and full retention examples are documented in [Zeebe Elasticsearch Exporter retention](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter). The snippet below shows only the Helm values related to enabling retention:

```yaml
# Either enable Optimize, which in turn enables the legacy Zeebe exporter:
optimize:
  enabled: true

# Or enable the legacy Zeebe exporter directly:
orchestration:
  exporters:
    zeebe:
      enabled: true

# Zeebe records retention (Elasticsearch/OpenSearch Exporter indices)
orchestration:
  retention:
    enabled: true
    minimumAge: 30d
    policyName: zeebe-record-retention-policy
```

#### Retention configuration

Both scenarios use the same retention configuration:

```yaml
orchestration:
  # Zeebe records retention
  retention:
    enabled: true
    minimumAge: 30d
    policyName: zeebe-record-retention-policy

  # Historical data archiving and retention
  history:
    waitPeriodBeforeArchiving: 1h
    rolloverInterval: 1d
    rolloverBatchSize: 500
    elsRolloverDateFormat: date
    delayBetweenRuns: 2000
    maxDelayBetweenRuns: 60000
    retention:
      enabled: true
      minimumAge: 30d
      policyName: camunda-history-retention-policy
      usageMetricsMinimumAge: 730d
      usageMetricsPolicyName: camunda-usage-metrics-retention-policy
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention
