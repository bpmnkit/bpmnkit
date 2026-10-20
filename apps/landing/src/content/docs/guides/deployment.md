---
title: Camunda 8 Deployment
description: Deploy and manage BPMN processes on a live Camunda 8 cluster using @bpmnkit/api.
sidebar:
  order: 5
---

The `@bpmnkit/api` package is a fully-typed Camunda 8 REST API client. Use it to deploy
processes, start instances, and manage your cluster from Node.js scripts, backend services,
or CI/CD pipelines. The [`casen` CLI](#from-the-cli) does the same from a terminal.

## Setup

`baseUrl` is the cluster's Orchestration Cluster REST address, ending in `/v2`. Every method
path is appended to it.

### SaaS (Camunda 8 Cloud)

In Camunda Hub, open **Console → Clusters**, pick your cluster, and on its **API** tab click
**Create new client**. The credentials file it offers holds every value below.

```typescript
import { CamundaClient } from "@bpmnkit/api";

const client = new CamundaClient({
  // e.g. https://bru-2.zeebe.camunda.io/<cluster-id>
  baseUrl: `${process.env.ZEEBE_REST_ADDRESS}/v2`,
  auth: {
    type: "oauth2",
    clientId: process.env.ZEEBE_CLIENT_ID ?? "",
    clientSecret: process.env.ZEEBE_CLIENT_SECRET ?? "",
    tokenUrl: process.env.ZEEBE_AUTHORIZATION_SERVER_URL ?? "",
    audience: "zeebe.camunda.io",
  },
});
```

### Self-Managed

```typescript
const client = new CamundaClient({
  baseUrl: "http://localhost:8080/v2",
  auth: {
    type: "bearer",
    token: process.env.ZEEBE_TOKEN ?? "",
  },
});
```

### No Auth (local dev)

```typescript
const client = new CamundaClient({
  baseUrl: "http://localhost:8080/v2",
  auth: { type: "none" },
});
```

`new CamundaClient()` with no arguments reads `CAMUNDA_BASE_URL` and the `CAMUNDA_AUTH_*`
variables instead.

## Deploying a Process

A deployment is a multipart upload: append each file under the `resources` field.

```typescript
import { Bpmn } from "@bpmnkit/core";

const xml = Bpmn.export(
  Bpmn.createProcess("invoice-approval")
    .startEvent("start")
    .userTask("review", { name: "Review Invoice" })
    .endEvent("end")
    .withAutoLayout()
    .build()
);

const form = new FormData();
form.append("resources", new Blob([xml]), "invoice-approval.bpmn");

const result = await client.resource.createDeployment(form);

console.log("Deployed version:", result.deployments[0]?.processDefinition?.processDefinitionVersion);
```

## Starting Process Instances

```typescript
const instance = await client.processInstance.createProcessInstance({
  processDefinitionId: "invoice-approval",
  variables: {
    invoiceId: "inv-1234",
    amount: 2500,
    submittedBy: "alice@example.com",
  },
});

console.log("Instance key:", instance.processInstanceKey);
```

### With a Specific Version

```typescript
const instance = await client.processInstance.createProcessInstance({
  processDefinitionId: "invoice-approval",
  processDefinitionVersion: 2,
  variables: { invoiceId: "inv-5678" },
});
```

## Handling Jobs

Service tasks wait for a job worker. [`@bpmnkit/worker-client`](https://www.npmjs.com/package/@bpmnkit/worker-client)
long-polls for jobs. Set `ZEEBE_ADDRESS` to the cluster's REST address (`ZEEBE_REST_ADDRESS`
from the credentials file, without `/v2`), plus `ZEEBE_CLIENT_ID` and `ZEEBE_CLIENT_SECRET`.
`ZEEBE_TOKEN_URL` defaults to the SaaS token endpoint.

```typescript
import { createWorkerClient } from "@bpmnkit/worker-client";

const worker = createWorkerClient({ workerName: "email-service" });

for await (const job of worker.poll("send-email")) {
  try {
    await sendEmail(job.variables);
    await job.complete({ sent: true, sentAt: new Date().toISOString() });
  } catch (err) {
    await job.fail(err instanceof Error ? err.message : String(err), job.retries - 1);
  }
}
```

## Querying Instances

```typescript
// List running instances
const instances = await client.processInstance.searchProcessInstances({
  filter: { processDefinitionId: "invoice-approval", state: "ACTIVE" },
});

// Get a specific instance
const instance = await client.processInstance.getProcessInstance("2251799813685249");

// Get its variables
const variables = await client.variable.searchVariables({
  filter: { processInstanceKey: instance.processInstanceKey },
});
```

## Managing Incidents

```typescript
// List open incidents
const incidents = await client.incident.searchIncidents({
  filter: { state: "ACTIVE" },
});

// Resolve an incident (after fixing the underlying issue)
for (const { incidentKey } of incidents.items) {
  if (incidentKey) await client.incident.resolveIncident(incidentKey);
}
```

## Lifecycle Events

Use the TypedEventEmitter to react to API events:

```typescript
client.on("request", (e) => {
  console.log(`→ ${e.method} ${e.url}`);
});

client.on("response", (e) => {
  console.log(`← ${e.status} in ${e.durationMs}ms`);
});

client.on("error", (e) => {
  metrics.increment("camunda.api.error", { url: e.url });
});
```

## From the CLI

`casen profile import` reads the credentials file, so the CLI needs no flags after it:

```sh
casen profile import saas ./camunda-credentials.sh
casen profile use saas
casen deploy deploy invoice-approval.bpmn --target camunda8
casen process-instance create --data '{"processDefinitionId":"invoice-approval"}'
```

`casen resource create-deployment <file...>` deploys several files, such as a process and
its DMN tables, as one deployment.

## CI/CD: Deploy on Push

A typical GitHub Actions step:

```yaml
- name: Deploy BPMN processes
  run: node scripts/deploy.mjs
  env:
    ZEEBE_REST_ADDRESS: ${{ secrets.ZEEBE_REST_ADDRESS }}
    ZEEBE_CLIENT_ID: ${{ secrets.ZEEBE_CLIENT_ID }}
    ZEEBE_CLIENT_SECRET: ${{ secrets.ZEEBE_CLIENT_SECRET }}
    ZEEBE_AUTHORIZATION_SERVER_URL: ${{ secrets.ZEEBE_AUTHORIZATION_SERVER_URL }}
```

```typescript
// scripts/deploy.mjs
import { CamundaClient } from "@bpmnkit/api";
import { readdir, readFile } from "node:fs/promises";

const client = new CamundaClient({
  baseUrl: `${process.env.ZEEBE_REST_ADDRESS}/v2`,
  auth: {
    type: "oauth2",
    clientId: process.env.ZEEBE_CLIENT_ID,
    clientSecret: process.env.ZEEBE_CLIENT_SECRET,
    tokenUrl: process.env.ZEEBE_AUTHORIZATION_SERVER_URL,
    audience: "zeebe.camunda.io",
  },
});

const form = new FormData();
for (const file of await readdir("./processes")) {
  if (!/\.(bpmn|dmn|form)$/.test(file)) continue;
  form.append("resources", new Blob([await readFile(`./processes/${file}`)]), file);
}

// One deployment: every file goes in, or none does
const result = await client.resource.createDeployment(form);
console.log(`Deployed ${result.deployments.length} resources`);
```
