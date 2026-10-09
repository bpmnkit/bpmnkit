# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — opensearch

The following uses the [OpenSearch Index API](https://docs.opensearch.org/docs/latest/api-reference/index-apis/get-index-template/) to list all index templates.

```bash
curl -s "$OPENSEARCH_ENDPOINT/_index_template" \
   | jq -r '.index_templates[].name' \
   | grep -E 'operate|tasklist|optimize|zeebe' \
   | sort
```

   
      Example Output

      ```bash
      operate-batch-operation-1.0.0_template
      operate-decision-instance-8.3.0_template
      operate-event-8.3.0_template
      operate-flownode-instance-8.3.1_template
      operate-incident-8.3.1_template
      operate-job-8.6.0_template
      operate-list-view-8.3.0_template
      operate-message-8.5.0_template
      operate-operation-8.4.1_template
      operate-post-importer-queue-8.3.0_template
      operate-sequence-flow-8.3.0_template
      operate-user-task-8.5.0_template
      operate-variable-8.3.0_template
      tasklist-draft-task-variable-8.3.0_template
      tasklist-task-8.5.0_template
      tasklist-task-variable-8.3.0_template
      ...
      ```

#### 2. Stop Optimize

The Restore API keeps the brokers running in recovery mode and the web applications up, so only Optimize needs to be stopped before you restore the Elasticsearch/OpenSearch snapshots.

If you are using the Camunda Helm chart, disable Optimize in the `values.yml`:

```yaml
optimize:
  enabled: false
```

#### 3. Delete all indices

Now that you have successfully restored the templates and stopped the components adding more indices, you must delete the existing indices to be able to successfully restore the snapshots (otherwise these will block a successful restore).

**Warning**
If multiple physical tenants are configured, make sure to delete the indices corresponding to the required tenant by specifying the proper prefix.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
