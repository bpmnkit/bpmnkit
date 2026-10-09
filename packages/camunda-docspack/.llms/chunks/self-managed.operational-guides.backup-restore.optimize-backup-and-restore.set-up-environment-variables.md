# Back up and restore Optimize independently — Set up environment variables

The following examples use environment variables for conciseness:

  
### port-forwarding

  
### elasticsearch

```bash
export BACKUP_ID=$(date +%s)   # Unix timestamp as unique, always-increasing ID

export OPTIMIZE_MANAGEMENT_API="http://localhost:8092"

export ELASTIC_SNAPSHOT_REPOSITORY="camunda"   # Name of your snapshot repository
export ELASTIC_ENDPOINT="http://localhost:9200"
```

  
  
### opensearch

```bash
export BACKUP_ID=$(date +%s)   # Unix timestamp as unique, always-increasing ID

export OPTIMIZE_MANAGEMENT_API="http://localhost:8092"

export OPENSEARCH_SNAPSHOT_REPOSITORY="camunda"   # Name of your snapshot repository
export OPENSEARCH_ENDPOINT="<your-opensearch-endpoint>"
```

  

  
  
### exec

  
### elasticsearch

```bash
export BACKUP_ID=$(date +%s)
export CAMUNDA_RELEASE_NAME="camunda"

export OPTIMIZE_MANAGEMENT_API="http://$CAMUNDA_RELEASE_NAME-optimize:8092"

export ELASTIC_SNAPSHOT_REPOSITORY="camunda"
export ELASTIC_ENDPOINT="http://$CAMUNDA_RELEASE_NAME-elasticsearch:9200"
```

  
  
### opensearch

```bash
export BACKUP_ID=$(date +%s)
export CAMUNDA_RELEASE_NAME="camunda"

export OPTIMIZE_MANAGEMENT_API="http://$CAMUNDA_RELEASE_NAME-optimize:8092"

export OPENSEARCH_SNAPSHOT_REPOSITORY="camunda"
export OPENSEARCH_ENDPOINT="<your-opensearch-endpoint>"
```

  

  

**Note**
We recommend using the Unix timestamp as the backup ID. The backup ID must be a positive integer and must be greater than the ID used for any previous backup.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore
