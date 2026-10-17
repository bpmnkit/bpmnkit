# Migrate from the removed Operate API

The Operate API was removed in Camunda 8.10. Use the Orchestration Cluster REST API instead.

**Warning**
The Operate API was removed in Camunda 8.10 and is no longer part of the current documentation set.

For the release-level summary of this removal, see the [8.10 release announcement](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements#removal-of-legacy-apis-tasklist-v1-dependent-features-and-zeebe-process-test).

Use the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) for current integrations, and review [migrating to the Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api) if you still have clients that call the removed Operate API.

If you need legacy Operate API behavior as migration context, use the migration manuals in the current docs rather than building new integrations against the removed endpoints.

---
Source: https://docs.camunda.io/docs/next/apis-tools/operate-api/overview
