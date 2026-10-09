# Restore a backup with the Restore API — Restoring an Elasticsearch/OpenSearch-backed cluster — 3. Restore Elasticsearch/OpenSearch snapshots {#restore-es-snapshots-step}

With the cluster in recovery mode, restore the Elasticsearch/OpenSearch snapshots to the intended point in time, using the same backup ID that you pass to the Restore API. A mismatched backup ID produces an inconsistent restore point.

Keep the Orchestration Cluster running in recovery mode while you restore the snapshots.

#### 1. Restore templates

**Note**
This step is only required for restoring an Elasticsearch/OpenSearch snapshot on a fresh cluster.

This step includes restoring index and component [templates](https://www.elastic.co/docs/manage-data/data-store/templates) crucial for Camunda 8 to function properly on continuous use.

These templates are automatically applied on newly created indices. These templates are only created on the initial start of the components and the first seeding of the secondary datastore, due to which you have to temporarily restore them before you can restore all Elasticsearch/OpenSearch snapshots.

Start Camunda 8 configured with your secondary datastore endpoint:

- For example, deploy the Camunda Helm chart.
- For manual context, start Camunda 8 components manually.
- Depending on your setup this can mean Orchestration Cluster (Operate, Tasklist, Zeebe), Optimize and the required secondary datastore.

The templates are created by the Web Applications (Operate, Tasklist), and Optimize on startup on the first seeding of the datastore. Zeebe creates this whenever it is required, and isn't limited to the initial start. We recommend starting your full required Camunda 8 stack for the applications to show up as healthy.

You can confirm the successful creation of the index templates by using the Elasticsearch/OpenSearch API. The index templates rely on the component templates, so it also confirms these were successfully recreated.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
