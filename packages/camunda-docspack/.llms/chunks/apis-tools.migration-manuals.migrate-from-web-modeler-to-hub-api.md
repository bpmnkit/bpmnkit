# Migrate from Web Modeler to the Camunda Hub API

Learn how to migrate from Web Modeler API v1 to the new Camunda Hub API v2 to manage Camunda Hub resources.

**Warning: Deprecation notice**
Web Modeler API v1 is deprecated in Camunda 8.10 and will be removed in 8.12. Migrate to [Camunda Hub API v2](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/overview) before upgrading to 8.12.


## About this migration

Web Modeler API v1 is the REST API for Web Modeler, a standalone product for modeling and managing process diagrams. It exposes resources like projects, folders, files, and collaborators as they exist within Web Modeler.

[Camunda Hub API v2](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/overview) is the successor API for the broader Camunda Hub platform. Camunda Hub unifies organizational management, workspace governance, and process modeling into a single platform. As a result, the conceptual model and architecture of the API have changed.

**Tip**
Camunda Hub API v2 adopts the [Orchestration Cluster API v2](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) conventions. If you're already familiar with the Orchestration Cluster API v2, you will recognize patterns such as the offset-based pagination model, explicit filter operators, and flat response structures used throughout Camunda Hub API v2.

Before migrating, familiarize yourself with the structural and terminology changes introduced in Camunda 8.10.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
