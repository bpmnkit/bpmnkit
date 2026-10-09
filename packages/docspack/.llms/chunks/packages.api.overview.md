# @bpmnkit/api — Overview

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

---
Source: https://bpmnkit.com/docs/packages/api
