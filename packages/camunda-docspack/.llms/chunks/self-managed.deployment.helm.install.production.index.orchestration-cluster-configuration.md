# Install Camunda for production with Helm — Orchestration Cluster configuration

**Note**
At this point, you should be able to connect to your platform through HTTPS, correctly authenticate users using your configured identity provider, and have connected to external databases such as Amazon OpenSearch and Amazon Aurora PostgreSQL.

The next steps focus on the Camunda application-specific configurations suitable for a production environment. The following sections continue to add to the `hub-values.yaml` and `orchestration-values.yaml` at the Camunda component-level.

### Elasticsearch/OpenSearch index retention

An index lifecycle management (ILM) policy in OpenSearch is crucial for efficient management and operation of large-scale search and analytics workloads. ILM policies provide a framework for automating the management of index lifecycles, which directly impacts performance, cost efficiency, and data retention compliance.

The Helm value **`orchestration.history.retention`** configures retention for archived Operate, Tasklist, and Camunda indices stored in secondary storage (for example, `operate-process-*`, `tasklist-task-*`).

The following example configures an ILM policy for the Orchestration Cluster's archived history indices and can be added to the Helm values file `orchestration-values.yaml`:

```yaml
orchestration:
  history:
    rolloverInterval: 7d
    retention:
      enabled: true
      minimumAge: 30d
      policyName: camunda-history-retention-policy
```

**Warning**
The `orchestration.history.rolloverInterval` value significantly affects Elasticsearch/OpenSearch performance. Review the [data retention performance](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention#performance) section to ensure the value fits your use case.

**Note**
For more information on configuring both retention policy types, refer to the [data retention configuration guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention).

### Configure backups

In order to configure backups, refer to the [backup guide](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) for Self-Managed installations.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
