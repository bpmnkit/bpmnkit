# Tasklist API changes — Removed legacy behavior

The following behavior was tied to Tasklist V1 and is no longer available in 8.10 and later:

- Job worker-based user tasks
- Draft variables
- User task access restrictions
- Public start forms
- Advanced process filtering that depended on Tasklist V1
- Task context description and context variables
- The Tasklist-specific permission and visibility model from V1


## Recommended replacements

- Use the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) for task, form, and process interactions.
- Use [user task authorization](https://docs.camunda.io/docs/next/components/tasklist/user-task-authorization) for current Tasklist access control.
- Use the [migration guide for Camunda user tasks](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks) if you still have job worker-based user tasks.
- Use [migrating to the Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api) if you still have integrations that call the removed Tasklist API.

---
Source: https://docs.camunda.io/docs/next/components/tasklist/api-versions
