# Elasticsearch without cluster privileges — Update index settings with the standalone schema manager {#settings-updates}

You can use the standalone schema manager to roll out certain index template setting changes without granting cluster privileges to the continuously running Camunda application.

Supported settings (see [configuration references](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#index--retention-settings) and the [Elasticsearch exporter configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter#configuration)):

- **numberOfShards** (Operate / Tasklist / Camunda / Zeebe Elasticsearch exporter) — static: applies only to new indices created after the change. Existing indices keep their shard count.
- **numberOfReplicas** (Operate / Tasklist / Camunda) — dynamic: applied to existing indices and index templates.
- **numberOfReplicas** (Zeebe Elasticsearch exporter) — static: applies only to new indices created after the change. Existing indices keep their replica count.
- **templatePriority** (Operate / Tasklist / Camunda / Zeebe Elasticsearch exporter): determines precedence when multiple index templates match. Higher priority templates override lower ones.

#### When to use the schema manager for settings updates

Use the standalone schema manager if you need to:

- Adjust index template-level settings for future indices.
- Trigger a global index replicas count change.
- Modify index template priority.

#### Procedure

1. Prepare a schema manager configuration that includes the new settings.
   - For Operate and Tasklist version 8.7.11+, set `updateSchemaSettings: true`.

   Example configuration:

   ```yaml
   zeebe.broker.exporters.elasticsearch:
     class-name: io.camunda.zeebe.exporter.ElasticsearchExporter
     args:
       index:
         create-template: true
         number-of-shards: 3 # affects only new Zeebe record indices
         number-of-replicas: 1 # affects only new Zeebe record indices
         template-priority: 25 # optional, overrides default priority 20
        ... # other settings
   camunda:
     database:
       index:
         number-of-shards: 1 # only new Operate/Tasklist/Camunda indices
         number-of-replicas: 1 # updates existing Operate/Tasklist/Camunda indices
         template-priority: 25 # optional, overrides default priority 0
        ... # other settings
   ```

2. Run the standalone schema manager with a user that has the required cluster privileges (see [Initialize the schema manager](#initialize)). You can keep the Camunda application online without cluster privileges.
3. Check the logs to confirm the schema manager completed successfully.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
