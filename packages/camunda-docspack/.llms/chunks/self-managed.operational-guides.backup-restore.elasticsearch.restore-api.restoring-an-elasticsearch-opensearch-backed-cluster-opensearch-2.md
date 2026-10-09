# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — opensearch

The following uses the [OpenSearch CAT API](https://docs.opensearch.org/docs/latest/api-reference/cat/cat-indices/) to list all indices. It also uses the [OpenSearch Index API](https://docs.opensearch.org/docs/latest/api-reference/index-apis/delete-index/) to delete an index.

```bash
for index in $(curl -s "$OPENSEARCH_ENDPOINT/_cat/indices?h=index" \
   | grep -E 'camunda|operate|tasklist|optimize|zeebe'); do
      echo "Deleting index: $index"
      curl -X DELETE "$OPENSEARCH_ENDPOINT/$index"
done
```

   
      Example Output

      ```bash
      Deleting index: operate-import-position-8.3.0_
      {"acknowledged":true}Deleting index: operate-migration-steps-repository-1.1.0_
      {"acknowledged":true}Deleting index: operate-flownode-instance-8.3.1_
      {"acknowledged":true}Deleting index: operate-event-8.3.0_
      {"acknowledged":true}Deleting index: operate-incident-8.3.1_
      {"acknowledged":true}Deleting index: tasklist-web-session-1.1.0_
      {"acknowledged":true}Deleting index: tasklist-variable-8.3.0_
      {"acknowledged":true}Deleting index: operate-user-task-8.5.0_
      {"acknowledged":true}Deleting index: tasklist-import-position-8.2.0_
      {"acknowledged":true}Deleting index: tasklist-task-variable-8.3.0_
      {"acknowledged":true}Deleting index: tasklist-flownode-instance-8.3.0_
      {"acknowledged":true}Deleting index: operate-process-8.3.0_
      {"acknowledged":true}Deleting index: tasklist-process-instance-8.3.0_
      {"acknowledged":true}Deleting index: operate-operation-8.4.1_
      {"acknowledged":true}Deleting index: operate-job-8.6.0_
      {"acknowledged":true}Deleting index: operate-metric-8.3.0_
      {"acknowledged":true}Deleting index: tasklist-migration-steps-repository-1.1.0_
      {"acknowledged":true}Deleting index: operate-decision-8.3.0_
      {"acknowledged":true}Deleting index: tasklist-process-8.4.0_
      {"acknowledged":true}Deleting index: operate-variable-8.3.0_
      {"acknowledged":true}Deleting index: operate-message-8.5.0_
      {"acknowledged":true}Deleting index: operate-decision-requirements-8.3.0_
      {"acknowledged":true}Deleting index: operate-batch-operation-1.0.0_
      {"acknowledged":true}Deleting index: operate-web-session-1.1.0_
      {"acknowledged":true}Deleting index: tasklist-user-1.4.0_
      {"acknowledged":true}Deleting index: operate-list-view-8.3.0_
      {"acknowledged":true}Deleting index: tasklist-metric-8.3.0_
      {"acknowledged":true}Deleting index: operate-post-importer-queue-8.3.0_
      {"acknowledged":true}Deleting index: tasklist-task-8.5.0_
      {"acknowledged":true}Deleting index: tasklist-form-8.4.0_
      {"acknowledged":true}Deleting index: operate-user-1.2.0_
      {"acknowledged":true}Deleting index: tasklist-draft-task-variable-8.3.0_
      {"acknowledged":true}Deleting index: operate-decision-instance-8.3.0_
      {"acknowledged":true}Deleting index: operate-sequence-flow-8.3.0_
      {"acknowledged":true}
      ```

#### 4. Restore the snapshots

Although the backup order was important so far to ensure consistent backups, you can restore the backed up indices in any order.

As the components do not have an endpoint to restore the backup in Elasticsearch, you will need to restore it yourself directly in your selected datastore.

Using your chosen backup ID from the previous step, restore the snapshots in Elasticsearch/OpenSearch for each available backup under the same backup ID.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
