# Restore a backup with the Restore Application — 1. Restore Elasticsearch/OpenSearch snapshots {#restore-es-snapshots-step} — elasticsearch

The following uses the [Elasticsearch Index API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-get-index-template) to list all index templates.

```bash
curl -s "$ELASTIC_ENDPOINT/_index_template" \
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
      operate-variable-8.3.0_template
      tasklist-draft-task-variable-8.3.0_template
      tasklist-task-8.5.0_template
      tasklist-task-variable-8.3.0_template
      ...
      ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-application
