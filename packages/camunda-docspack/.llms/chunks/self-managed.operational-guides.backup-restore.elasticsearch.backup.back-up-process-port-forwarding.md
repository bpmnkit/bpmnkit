# Camunda backup creation (Elasticsearch/OpenSearch) — Back up process — port-forwarding

```bash
      # only export the BACKUP_ID once as it has to stay consistent throughout the backup procedure
      export BACKUP_ID=$(date +%s) # unix timestamp as unique always increasing ID

      export ELASTIC_SNAPSHOT_REPOSITORY="camunda" # the name of your snapshot repository
      export ELASTIC_ENDPOINT="http://localhost:9200"

      export OPENSEARCH_SNAPSHOT_REPOSITORY="camunda" # the name of your snapshot repository
      export OPENSEARCH_ENDPOINT="" # highly dependent on your environment

      export ORCHESTRATION_CLUSTER_API="http://localhost:8080/v2"
      export ORCHESTRATION_CLUSTER_MANAGEMENT_API="http://localhost:9600"
      export OPTIMIZE_MANAGEMENT_API="http://localhost:9620"
      ```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
