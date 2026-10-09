# Batch operations — Prerequisites

To use batch operations, you need:

- A Zeebe cluster with secondary storage configured (Elasticsearch or OpenSearch)
- Appropriate [authorization permissions](https://docs.camunda.io/docs/next/components/concepts/batch-operations#authorization) for the operations you want to perform
- Access to one of the following:
  - [Operate UI](https://docs.camunda.io/docs/next/components/operate/operate-introduction) (for basic operations)
  - [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) (for full lifecycle management)
  - [Camunda Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started) (for programmatic access)


## Batch operation components

A Zeebe batch operation always consists of two parts:

- **The command:**  
  The batch operation type determines the action performed on the process instances.  
  For example, the type `MIGRATE_PROCESS_INSTANCE` means a request to migrate process instances to a new process definition version.  
  Some batch types require more details, such as a migration plan for process instance migration or a modification plan for process instance modifications.

- **The batch operation items:**  
  The items are not directly defined at creation. Instead, a filter describes them.  
  This filter is applied to the configured secondary database (for example, Elasticsearch) to identify matching process instances.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/batch-operations
