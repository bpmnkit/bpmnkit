# Migrate to the Orchestration Cluster API

How to progressively adopt the Orchestration Cluster API in an existing application.

Migrate an existing Camunda 8 TypeScript application from `@camunda8/sdk` to use the `@camunda8/orchestration-cluster-api`.


## Choose a client option

For existing applications using `@camunda8/sdk`, the SDK includes the Orchestration Cluster API client by depending on the `@camunda8/orchestration-cluster-api` package and normalizing configuration to ensure forward compatibility without requiring configuration changes. Use the following guidance to choose between the SDK-bundled client and the focused `@camunda8/orchestration-cluster-api` package.

Use the bundled client if:

- You depend on APIs not supported by the focused client, such as gRPC.
- You do not care about application size and do not want to modify your environment configuration.

Import the focused client directly alongside the SDK if:

- You do not use the gRPC API.
- Your application targets Camunda 8.9 or later.
- You intend to migrate completely to the Orchestration Cluster API and remove all other API usage in your application.
- You do not mind changing or extending your application configuration.

### Key differences

Using the bundled client in `@camunda8/sdk`:

- Will always pull in as dependencies all the other API clients and their dependencies.
- Uses the same configuration variables across the various clients (the SDK normalizes configuration).

```typescript
import { Camunda8 } from "@camunda8/sdk";

const clientFactory = new Camunda8();
// Get a strongly typed CamundaClient
const camunda = clientFactory.getOrchestrationClusterApiClient();

// Get a loosely typed CamundaClient
const camundaLoose = clientFactory.getOrchestrationClusterApiClient();
```

Using the focused client in `@camunda8/orchestration-cluster-api`:

- Allows you to reduce the application dependency to the Orchestration Cluster API client only.
- Requires you to change the environment configuration (the focused client uses distinct configuration).

```typescript
import {
  createCamundaClient,
  createCamundaClientLoose,
} from "@camunda8/orchestration-cluster-api";

// Get a strongly-typed CamundaClient
const camunda = createCamundaClient();

// Get a loosely-typed CamundaClient
const camundaLoose = createCamundaClientLoose();
```

As a middle ground, you can use the bundled client initially and then switch to the focused client when you are ready to update the configuration.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/migrating-to-oca
