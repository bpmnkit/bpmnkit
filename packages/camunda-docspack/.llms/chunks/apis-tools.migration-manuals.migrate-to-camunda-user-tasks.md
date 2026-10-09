# Migrate to Camunda user tasks

Learn how to migrate job worker-based user tasks to Camunda user tasks.

**Note: Have you already migrated?**
You do not need to perform this migration again if you already did this when upgrading to version 8.8. This guide is retained to help customers migrate before upgrading from 8.9 to 8.10. See [API and SDK changes to migrate before Camunda 8.10](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-810#api-and-sdk-changes-to-migrate-before-camunda-810).


## About

Camunda 8.7 introduced a new [user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks) implementation type: Camunda user task (formerly named Zeebe user task).

Camunda user tasks have several benefits compared to Job worked-based user tasks, including:

- Running directly on the automation engine for high performance.
- Removing dependencies and round trips to Tasklist.
- A powerful API that supports the full task lifecycle.

In this guide, you will learn:

- Under which circumstances and when you should migrate.
- How to estimate the impact on a project.
- Steps you need to take for a successful migration without interrupting your operations.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks
