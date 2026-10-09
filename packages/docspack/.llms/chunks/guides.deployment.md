# Camunda 8 Deployment

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

---
Source: https://bpmnkit.com/docs/guides/deployment
