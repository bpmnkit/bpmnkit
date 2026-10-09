# Elasticsearch without cluster privileges — Minor version upgrades using the standalone schema manager {#minor-upgrades}

Prepare a Camunda minor version upgrade by running the standalone schema manager for the target version (`N+1`). This pre-creates or adjusts index templates and mappings. You can then upgrade the Camunda single application, minimizing downtime for upgrades that require only schema adjustments.

**Important**
Upgrading from 8.7 → 8.8 requires migration steps. Follow the relevant guides and plan a maintenance window:

- [Components upgrade 8.7 to 8.8](https://docs.camunda.io/docs/next/versioned_docs/version-8.8/self-managed/upgrade/components/870-to-880)
- [Helm chart upgrade guide: 8.7 to 8.8](https://docs.camunda.io/docs/next/versioned_docs/version-8.8/self-managed/upgrade/helm/870-to-880)

These steps may require stopping or scaling down the Camunda application before running the migration.

If the target upgrade also requires a data or application migration (as documented in [Upgrade to Camunda 8.8](https://docs.camunda.io/docs/next/versioned_docs/version-8.8/self-managed/upgrade/index)), follow the migration sequence:

1. Stop the Camunda application (or scale it down) before executing the migration logic.
2. Run the schema manager for version `N+1` with a privileged user if schema changes are part of the upgrade.
3. Execute any required migration tooling or steps described in the upgrade documentation.
4. Start or roll out the Camunda application at version `N+1` with schema creation disabled.

If no migration is required, you can keep the application running at version `N` while you run the schema manager for version `N+1`.

#### High-level flow

1. Current state: Camunda single application is running at version `N` (for example, 8.7) and processing traffic with its indices in Elasticsearch.

2. Verification: Check the upgrade documentation for version `N → N+1` (for example, 8.7 → 8.8) to determine if migrations are required.
   - If migrations are not required, continue while keeping `N` running.
   - If migrations are required, schedule downtime and stop the application before running migration steps.

3. Preparation: Obtain the Camunda distribution for version `N+1`.

4. Run the schema manager for version `N+1` with a configuration that grants the required cluster privileges (see [Initialize the schema manager](#initialize)). Keep the existing application at version `N` running. The schema manager applies any new or updated templates, mappings, and ILM policies (if enabled) required by version `N+1`.

5. Completion check: Wait until the schema manager logs successful completion and exits without errors.

6. Application upgrade: Upgrade or perform a rolling update of the Camunda single application from version `N` to `N+1`, using a configuration that disables schema creation. The new version will reuse the already-prepared indices.

#### Example timeline

| Time | Action                                                                  |
| ---- | ----------------------------------------------------------------------- |
| T0   | App v8.6.X running, serving workload                                    |
| T1   | Launch schema manager v8.7.Y with elevated cluster privileges           |
| T2   | Schema manager completes successfully and exits                         |
| T3   | Upgrade or roll out application to v8.7.Y with schema creation disabled |
| T4   | Traffic now served by app v8.7.Y                                        |

This staged approach reduces or eliminates downtime for minor upgrades that require only schema adjustments.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/elasticsearch-without-cluster-privileges
