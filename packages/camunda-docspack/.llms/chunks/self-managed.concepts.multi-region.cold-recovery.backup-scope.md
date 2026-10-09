# Cold Recovery — Backup scope

You must back up **both** Primary and Secondary storage layers for a complete Cold Recovery backup. See [backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore).

| Layer                                            | Backup target                            | Backup mechanism                                                         |
| :----------------------------------------------- | :--------------------------------------- | :----------------------------------------------------------------------- |
| **Primary storage** (Zeebe log stream)           | Zeebe partition snapshots                | Zeebe Backup Management API                                              |
| **Secondary storage** (Elasticsearch/OpenSearch) | Elasticsearch/OpenSearch index snapshots | Orchestration cluster backup API                                         |
| **Secondary storage** (RDBMS)                    | Database dump or continuous backup       | Database-native tools (`pg_dump`, Oracle RMAN, AWS RDS automated backup) |

The RDBMS backup path is the **first phase** of new backup capabilities and currently covers a narrower set of components than the Elasticsearch/OpenSearch path. See [relational database backup](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup) for the components it includes.

### Component coverage

The following table shows backup component coverage:

| Component                   | Included in backup?                                | Notes                                          |
| :-------------------------- | :------------------------------------------------- | :--------------------------------------------- |
| **Zeebe** (primary storage) | Yes (partition snapshots)                          | Required                                       |
| **Operate**                 | Yes (via Elasticsearch/OpenSearch or RDBMS backup) | State is stored in secondary storage           |
| **Tasklist**                | Yes (via Elasticsearch/OpenSearch or RDBMS backup) | State is stored in secondary storage           |
| **Admin**                   | Yes (via Elasticsearch/OpenSearch or RDBMS backup) | Authentication and authorization configuration |
| **Optimize**                | Elasticsearch/OpenSearch path only                 | Standalone component; back up independently    |
| **Management Identity**     | Not included                                       | Standalone component; back up independently    |
| **Camunda Hub**             | Not included                                       | Standalone component; back up independently    |
| **Connectors**              | Not included                                       | Stateless; redeploy from source                |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery
