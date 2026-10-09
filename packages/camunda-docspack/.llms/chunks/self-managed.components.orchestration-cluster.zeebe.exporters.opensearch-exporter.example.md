# OpenSearch exporter — Example

The following is an example configuration of the exporter:

```yaml
---
camunda:
  data:
    exporters:
      opensearch:
        # Opensearch exporter ----------
        # An example configuration for the opensearch exporter:
        #
        # These settings can also be overridden using environment variables "CAMUNDA_DATA_EXPORTERS_OPENSEARCH_..."

        className: io.camunda.zeebe.exporter.opensearch.OpensearchExporter
        args:
          # A comma separated list of URLs pointing to the Opensearch instances you wish to export to.
          # For example, if you want to connect to multiple nodes for redundancy:
          # url: http://localhost:9200,http://localhost:9201
          url: http://localhost:9200

          bulk:
            delay: 5
            size: 1000
            memoryLimit: 10485760

          retention:
            enabled: true
            minimumAge: 30d
            policyName: zeebe-records-retention-policy
            policyDescription: Zeebe records retention policy

          authentication:
            username: opensearch
            password: changeme

          aws:
            enabled: true
            serviceName: es
            region: eu-west-1

          index:
            prefix: zeebe-record
            createTemplate: true

            command: false
            event: true
            rejection: false

            commandDistribution: true
            decisionRequirements: true
            decision: true
            decisionEvaluation: true
            deployment: true
            deploymentDistribution: true
            error: true
            escalation: true
            form: true
            incident: true
            job: true
            jobBatch: false
            message: true
            messageStartEventSubscription: true
            messageSubscription: true
            process: true
            processEvent: false
            processInstance: true
            processInstanceCreation: true
            processInstanceMigration: true
            processInstanceModification: true
            processMessageSubscription: true
            resourceDeletion: true
            signal: true
            signalSubscription: true
            timer: true
            userTask: true
            variable: true
            variableDocument: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter
