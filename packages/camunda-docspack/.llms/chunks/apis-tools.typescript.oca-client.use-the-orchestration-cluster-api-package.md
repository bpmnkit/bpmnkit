# Orchestration Cluster API TypeScript client — Use the Orchestration Cluster API package

The following example retrieves the cluster topology:

1. Install the package in your project:

   ```bash
   npm i @camunda8/orchestration-cluster-api
   ```

2. Import it into your application:

   ```typescript
   import { createCamundaClient } from "@camunda8/orchestration-cluster-api";

   const camunda = createCamundaClient();

   async function main() {
     const response = await camunda.getTopology();
     console.log(JSON.stringify(response, null, 2));
   }

   main();
   ```

   The `createCamundaClient` function returns a strongly typed client.


## Example project

See a [complete example project](https://github.com/camunda-community-hub/c8-sdk-demo) that demonstrates how to use the package.


## API documentation

See the [package README](https://camunda.github.io/orchestration-cluster-api-js/) and the [full API documentation](https://camunda.github.io/orchestration-cluster-api-js/classes/index.CamundaClient.html) for more details.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/oca-client
