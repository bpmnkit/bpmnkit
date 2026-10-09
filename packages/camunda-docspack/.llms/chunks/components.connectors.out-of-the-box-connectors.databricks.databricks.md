# Databricks connector

Run SQL statements, control warehouses, trigger jobs, invoke Model Serving endpoints, and query Vector Search indexes on Databricks from your BPMN process.

The **Databricks connector** allows you to call the [Databricks REST API](https://docs.databricks.com/api/workspace/introduction) from your BPMN process — SQL Statement Execution, SQL Warehouses, Jobs, Model Serving, and Vector Search.

This connector reuses the base implementation of the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest) by providing a compatible element template. There is no additional runtime to deploy.


## Prerequisites

To use the **Databricks connector**, you need an active Camunda 8.9 or later cluster, and a Databricks workspace with — depending on the operation — a SQL warehouse, job, Model Serving endpoint, or Vector Search index to target.

You also need credentials to authenticate against your workspace. See [configure authentication](#configure-authentication) below.

**Note**
Use secrets to store credentials so you don't expose sensitive information directly from the process. See [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks
