# Migrate to the Orchestration Cluster API

Migrate from Camunda's V1 component REST APIs to the V2 Orchestration Cluster REST API to interact with Camunda 8 clusters, activate jobs, and run user task state operations.

**Note: Have you already migrated?**
You do not need to perform this migration again if you already did this when upgrading to version 8.8. This guide is retained to help customers migrate before upgrading from 8.9 to 8.10. See [API and SDK changes to migrate before Camunda 8.10](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-810#api-and-sdk-changes-to-migrate-before-camunda-810).


## About

This guide covers how to migrate to the V2 [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) before upgrading to Camunda 8.10, where the V1 component REST APIs are removed. It covers all public endpoints in the component REST APIs and their Orchestration Cluster API counterparts or required migration changes.

- Camunda is streamlining the developer experience by creating a unified REST API for Zeebe, Operate, Tasklist, and the Identity components with endpoint parity. This is the single Orchestration Cluster REST API.
- Individual component APIs (starting with the former Operate and Tasklist APIs) were deprecated before their removal in 8.10. Use this guide to complete the migration before upgrading.

**Info**
To learn more about the unified REST API, see [the official blog announcement](https://camunda.com/blog/2024/12/api-changes-in-camunda-8-a-unified-and-streamlined-experience/).

**Note**
The Administration and Web Modeler APIs are not part of the Orchestration Cluster REST API, as these are platform APIs outside the cluster’s scope.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
