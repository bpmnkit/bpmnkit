# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — opensearch

The following uses the [OpenSearch snapshot API](https://docs.opensearch.org/docs/latest/api-reference/snapshots/restore-snapshot/) to restore a snapshot.

```bash
curl -XPOST "$OPENSEARCH_ENDPOINT/_snapshot/$OPENSEARCH_SNAPSHOT_REPOSITORY/$SNAPSHOT_NAME/_restore?wait_for_completion=true"
```

   

Where `$SNAPSHOT_NAME` would be any of the following, based on the backup ID you found earlier:

```bash
camunda_optimize_1748937221_8.8.0_part_1_of_2
camunda_optimize_1748937221_8.8.0_part_2_of_2
camunda_webapps_1748937221_8.8.0_part_1_of_5
camunda_webapps_1748937221_8.8.0_part_2_of_5
camunda_webapps_1748937221_8.8.0_part_3_of_5
camunda_webapps_1748937221_8.8.0_part_4_of_5
camunda_webapps_1748937221_8.8.0_part_5_of_5
camunda_zeebe_records_backup_1748937221
```

Ensure that all your backups correspond to the same backup ID and that each one is restored one-by-one.

Complete this step before you trigger the Zeebe restore. The Restore API switches the brokers back to `PROCESSING` as soon as the last partition is restored, and processing then resumes against whatever secondary storage is in place.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
