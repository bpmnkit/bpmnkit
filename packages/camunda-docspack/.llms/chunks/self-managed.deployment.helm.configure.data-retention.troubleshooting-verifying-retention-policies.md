# Configure data retention — Troubleshooting — Verifying retention policies

After deploying with retention enabled, verify that the ILM/ISM policies were created successfully.

- Zeebe records retention (`zeebe-record-retention-policy`) applies to Elasticsearch/OpenSearch Exporter indices (Zeebe records) created by the legacy exporter (for example, indices matching the exporter prefix such as `zeebe-record-*`). The Zeebe Elasticsearch/OpenSearch Exporter creates this policy automatically during initialization, typically within a few minutes of deployment.

- History retention (`camunda-history-retention-policy`) applies to archived Orchestration Cluster indices used by Operate, Tasklist, and Camunda (for example, `operate-process-*`, `tasklist-task-*` with date suffixes).

The schema manager creates this ILM/ISM policy on application startup when `orchestration.history.retention.enabled: true`. The archiver then:

1. Creates archived indices and attaches the existing policy.
2. Waits for `waitPeriodBeforeArchiving` (default: 1 hour) after the **root process instance** completes.
3. Archives the completed hierarchy into dated indices (for example, `operate-process-8.3.0_2024-01-15`, `tasklist-task-8.8.0_2024-01-15`).

Set your database URL:

```bash
export DATABASE_URL="https://your-database-host:9200"
```

Replace `your-database-host` with your Elasticsearch or OpenSearch hostname.

Check if policies exist:

For **Elasticsearch**:

```bash
curl -X GET "${DATABASE_URL}/_ilm/policy/zeebe-record-retention-policy?pretty"
curl -X GET "${DATABASE_URL}/_ilm/policy/camunda-history-retention-policy?pretty"
```

For **OpenSearch**:

```bash
curl -X GET "${DATABASE_URL}/_plugins/_ism/policies/zeebe-record-retention-policy?pretty"
curl -X GET "${DATABASE_URL}/_plugins/_ism/policies/camunda-history-retention-policy?pretty"
```

Expected response for a policy with 30-day retention:

```json
{
  "zeebe-record-retention-policy": {
    "version": 1,
    "modified_date": "2025-01-15T10:30:00.000Z",
    "policy": {
      "phases": {
        "delete": {
          "min_age": "30d",
          "actions": {
            "delete": {}
          }
        }
      }
    }
  }
}
```

Check if archived indices exist:

```bash
curl -X GET "${DATABASE_URL}/_cat/indices/operate-*_20*?v"
curl -X GET "${DATABASE_URL}/_cat/indices/tasklist-*_20*?v"
```

Archived indices follow the pattern: `{component}-{type}-{schema-version}_{date}`  
Examples:

- `operate-process-8.3.0_2024-01-15`
- `operate-variable-8.3.0_2024-01-15`
- `tasklist-task-8.8.0_2024-01-15`

**Note: Index versioning**
The version number in index names (for example, `8.3.0`) represents the schema version, not necessarily the Camunda platform version. Schema versions evolve independently as index structures change. For details, see [schema and migration documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/schema-and-migration).

If no archived indices exist:

- No processes have completed and been archived yet
- The `waitPeriodBeforeArchiving` period hasn't elapsed
- Deploy and complete a test process, then wait for archiving to occur

Check if retention policy is applied to an archived index:

For **Elasticsearch**:

```bash
curl -X GET "${DATABASE_URL}/operate-process-8.3.0_2024-01-15/_settings?pretty" | grep -A 3 lifecycle
```

For **OpenSearch**:

```bash
curl -X GET "${DATABASE_URL}/_plugins/_ism/explain/operate-process-8.3.0_2024-01-15?pretty"
```

Expected output showing the policy is attached:

```json
{
  "index.lifecycle.name": "camunda-history-retention-policy"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention
