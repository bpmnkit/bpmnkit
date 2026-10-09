# Camunda Orchestration Cluster API connector

Query process, decision, user task, and audit data from the Camunda 8 Orchestration Cluster REST API (v2).

The **Orchestration Cluster API connector** allows you to query data from the [Camunda 8 Orchestration Cluster REST API (v2)](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview)
in your BPMN process. This connector is compatible with both Camunda 8 SaaS and Camunda 8 Self-Managed deployments.

**Note**
This connector replaces the deprecated Camunda Operate connector, which was compatible with Camunda 8.8 and earlier.

This connector is read-only by design. It only issues `GET` and `POST /search` requests; no state-changing operations (create, update, delete, cancel, migrate, modify, resolve, etc.) are exposed. If you need to trigger state-changing calls against the Orchestration Cluster API, use the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) instead.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/orchestration-cluster-api
