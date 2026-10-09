# Camunda Exporter — Example

Here is an example configuration of the exporter:

```yaml
---
exporters:
  # Camunda Exporter ----------
  # An example configuration for the camunda exporter:
  #
  # These setting can also be overridden using the environment variables "ZEEBE_BROKER_EXPORTERS_CAMUNDAEXPORTER_..."
  # To convert a YAML formatted variable to an environment variable, start with the top-level property and separate every nested property with an underscore (_).
  # For example, the property "zeebe.broker.exporters.camundaexporter.args.index.numberOfShards" would be converted to "ZEEBE_BROKER_EXPORTERS_CAMUNDAEXPORTER_ARGS_INDEX_NUMBEROFSHARDS".
  #
  camundaexporter:
    args:
      connect:
        dateFormat: yyyy-MM-dd'T'HH:mm:ss.SSSZZ
        socketTimeout: 1000
        connectTimeout: 1000

      bulk:
        delay: 5
        size: 1000

      index:
        numberOfShards: 3
        numberOfReplicas: 0

      history:
        elsRolloverDateFormat: "date"
        rolloverInterval: "1d"
        rolloverBatchSize: 500
        archiveByIdEnabled: true
        reindexBatchSize: 2500
        waitPeriodBeforeArchiving: "1h"
        delayBetweenRuns: 2000
        maxDelayBetweenRuns: 60000
        processInstanceEnabled: true
        retention:
          enabled: false
          minimumAge: 30d
          policyName: camunda-retention-policy
          usageMetricsMinimumAge: 730d
          usageMetricsPolicyName: camunda-usage-metrics-retention-policy
          applyPolicyJobInterval: PT1H

        batchOperation:
          exportItemsOnCreation: true

      skipVariableWriteWithoutUserTasks: false

      createSchema: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter
