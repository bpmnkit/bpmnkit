# Migrate Component V1 APIs

Learn about the changes required to continue using Camunda's V1 component REST APIs.

**Note: Have you already migrated?**
You do not need to perform this migration again if you already did this when upgrading to version 8.8. This guide is retained to help customers migrate before upgrading from 8.9 to 8.10. See [API and SDK changes to migrate before Camunda 8.10](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-810#api-and-sdk-changes-to-migrate-before-camunda-810).


## About

This document outlines the changes required to migrate from the component REST APIs before upgrading to Camunda 8.10, where the V1 component APIs are removed. Use it if migration to the new [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) was not yet possible during your 8.8 or 8.9 upgrade.

In this context, **components** refer to the standalone Camunda applications **Operate** and **Tasklist**, each exposing its own V1 REST API.

**Note**
As of version 8.8, the V1 component APIs are deprecated. They are removed in 8.10, so complete this migration before upgrading. We strongly recommend [migrating to the Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api) where possible.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-component-apis
