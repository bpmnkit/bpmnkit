---
title: "@bpmnkit/api"
description: Fully-typed Camunda 8 REST API client with OAuth2, caching, and retry.
sidebar:
  order: 3
---

## Overview

`@bpmnkit/api` is a complete TypeScript client for the Camunda 8 Orchestration Cluster
REST API:

- **180 typed methods** across 30+ resource classes
- **Auth**: OAuth2, Bearer token, Basic, and no-auth
- **LRU+TTL cache** for read-heavy operations
- **Exponential backoff** with configurable retry
- **TypedEventEmitter** for observability hooks
- Zero transitive runtime dependencies

## Installation

```sh
pnpm add @bpmnkit/api
```

## Client Configuration

`baseUrl` is the cluster's Orchestration Cluster REST address, ending in `/v2`. On Camunda
SaaS that is `ZEEBE_REST_ADDRESS` from a cluster's API client credentials file.

```typescript
import { CamundaClient } from "@bpmnkit/api";

const client = new CamundaClient({
  baseUrl: `${process.env.ZEEBE_REST_ADDRESS}/v2`,
  auth: {
    type: "oauth2",
    clientId: process.env.ZEEBE_CLIENT_ID ?? "",
    clientSecret: process.env.ZEEBE_CLIENT_SECRET ?? "",
    tokenUrl: process.env.ZEEBE_AUTHORIZATION_SERVER_URL ?? "",
    audience: "zeebe.camunda.io",
  },
  // Optional:
  cache: {
    enabled: true,    // cache eventually-consistent reads (default: false)
    maxSize: 500,     // entries (default: 500)
    ttl: 30_000,      // ms (default: 30_000)
  },
  retry: {
    maxAttempts: 3,   // default: 3
    initialDelay: 100,
    maxDelay: 5_000,
  },
});
```

With no arguments, `new CamundaClient()` reads `CAMUNDA_BASE_URL` and the `CAMUNDA_AUTH_*`
variables, or a config file named by `CAMUNDA_CONFIG_FILE`.

## Resource Namespaces

Methods are grouped by resource, one property per tag of the API spec. The most used:

| Namespace | Methods (selection) |
|---|---|
| `client.resource` | createDeployment, getResource, deleteResource |
| `client.processInstance` | createProcessInstance, searchProcessInstances, getProcessInstance, cancelProcessInstance |
| `client.processDefinition` | searchProcessDefinitions, getProcessDefinition, getProcessDefinitionXML |
| `client.job` | activateJobs, completeJob, failJob, throwJobError |
| `client.incident` | searchIncidents, getIncident, resolveIncident |
| `client.variable` | searchVariables, getVariable |
| `client.message` | publishMessage, correlateMessage |
| `client.signal` | broadcastSignal |
| `client.decisionDefinition` | evaluateDecision, searchDecisionDefinitions |
| `client.userTask` | searchUserTasks, getUserTask, assignUserTask, completeUserTask |

Users, groups, roles, tenants, authorizations, documents, batch operations and the rest have
their own namespaces (`client.user`, `client.group`, …).

## Process Operations

```typescript
// Deploy: a multipart upload, one `resources` part per file
const form = new FormData();
form.append("resources", new Blob([bpmnXml]), "my-flow.bpmn");
await client.resource.createDeployment(form);

// Start instance
const instance = await client.processInstance.createProcessInstance({
  processDefinitionId: "my-flow",
  variables: { customerId: "cust-001" },
});

// List active instances
const { items } = await client.processInstance.searchProcessInstances({
  filter: { processDefinitionId: "my-flow", state: "ACTIVE" },
});

// Cancel instance
await client.processInstance.cancelProcessInstance(instance.processInstanceKey);
```

## Job Workers

For a long-running worker, use [`@bpmnkit/worker-client`](/docs/guides/deployment#handling-jobs).
To handle a batch of jobs yourself:

```typescript
const { jobs } = await client.job.activateJobs({
  type: "send-email",
  maxJobsToActivate: 10,
  timeout: 60_000,          // job lock duration in ms
  worker: "email-worker-1",
});

for (const job of jobs) {
  try {
    await sendEmail(job.variables);
    await client.job.completeJob(job.jobKey, { variables: { emailSent: true } });
  } catch (err) {
    await client.job.failJob(job.jobKey, {
      errorMessage: String(err),
      retries: job.retries - 1,
    });
  }
}
```

## Incident Resolution

```typescript
// Find all incidents for a process instance
const { items: incidents } = await client.incident.searchIncidents({
  filter: { processInstanceKey: instance.processInstanceKey },
});

// Fix the problem in your code, then resolve
for (const { incidentKey } of incidents) {
  if (incidentKey) await client.incident.resolveIncident(incidentKey);
}
```

## Message Correlation

```typescript
await client.message.publishMessage({
  name: "payment-confirmed",
  correlationKey: "ord-456",
  variables: {
    paymentMethod: "card",
    confirmedAt: new Date().toISOString(),
  },
  timeToLive: 60_000,   // ms — how long to wait for a matching instance
});
```

## Observability Events

```typescript
client.on("request",  (e) => logger.debug(e.method, e.url));
client.on("response", (e) => metrics.histogram("api.latency", e.durationMs));
client.on("error",    (e) => logger.error(e.url, e.error.message));
client.on("retry",    (e) => logger.warn(`Retrying ${e.url} (attempt ${e.attempt})`));
```

The other events are `rawResponse`, `tokenRefresh`, `cacheHit` and `cacheMiss`.
