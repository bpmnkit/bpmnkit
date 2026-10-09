# Elasticsearch without cluster privileges — Standalone backup application — Limitations

- This feature only works for installations using Elasticsearch.
- Camunda Optimize data cannot be backed up with this setup.
- Some operations that are supported by the backup actuator API are not supported by this feature.

As a workaround, you can use the Elasticsearch API as follows:

#### List the snapshots of a backup

```
GET /_snapshot/<repository-name>/*_<backupID>_*
```

#### Delete the snapshots of a backup

**Warning**
Make sure the `<backupID>` you provide is not a single digit integer, otherwise the following command will delete more snapshots than desired.

```
DELETE /_snapshot/<repository-name>/*_<backupID>_*
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
