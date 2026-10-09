# Upgrade Camunda components from 8.9 to 8.10

Review component-level actions and migrations that may be required when upgrading Camunda 8 Self-Managed from version 8.9 to 8.10.

Review component-level actions that may be required when upgrading a Camunda 8 Self-Managed deployment from 8.9.x to 8.10.x.


## About

Use this page with the deployment upgrade guide for your environment. Start with the [Upgrade Camunda 8 overview](https://docs.camunda.io/docs/next/self-managed/upgrade/index), then apply any component-specific steps that match your setup.


## Camunda Hub

In 8.10, Camunda Hub replaces Console and Web Modeler. To support this change:

- Console-specific configurations have been removed.
- Cluster configurations have been updated.

Additionally, when you upgrade, your data is [migrated](#data-migration) to the [new file structure](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/whats-new-in-810#new-file-structure-and-requirements).

If you use a custom configuration, review this section and make applicable changes. Otherwise, the configuration updates mentioned here will not be relevant. Skip ahead to the [data migration](#data-migration).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
