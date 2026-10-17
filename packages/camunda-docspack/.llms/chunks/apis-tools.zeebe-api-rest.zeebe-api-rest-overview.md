# Overview

Interact with Zeebe clusters. Run user task state operations for Zeebe user tasks.

**Warning**
The Zeebe REST API is **deprecated**. While it continues to function, new development should use the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview). See the [migration guide](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api) for details.


## Introduction

The Zeebe REST API is a REST API designed to interact with the Zeebe workflow engine.

**Note**
Ensure you [authenticate](https://docs.camunda.io/docs/next/apis-tools/zeebe-api-rest/zeebe-api-rest-authentication) before accessing the Zeebe REST API.


## Context paths

### SaaS

Find your **region Id** and **cluster Id** under **Connection information** in your client credentials (revealed when you click on your client under the **API** tab within your cluster).

Example path: `https://${REGION}.api.camunda.io:443/${CLUSTER_ID}/v1/`

### Self-Managed

Use the host and path defined for your [Zeebe Gateway](https://docs.camunda.io/docs/next/reference/glossary#zeebe-gateway). For Ingress and routing details, see the [configuration guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup). The path used here is the default.

Example path: `http://localhost:8080/v1/`

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api-rest/zeebe-api-rest-overview
