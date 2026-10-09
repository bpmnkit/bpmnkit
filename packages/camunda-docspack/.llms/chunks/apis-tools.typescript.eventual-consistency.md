# Manage Orchestration Cluster API data consistency

Manage eventually consistent data when using the Orchestration Cluster API.

Learn how to manage eventually consistent data when using the Orchestration Cluster API.


## About eventual consistency

Data in Camunda 8 is [eventually consistent](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-data-fetching#data-consistency).

- To ensure that your applications behave explicitly and deterministically at runtime under different load scenarios, Orchestration Cluster API methods that access eventually consistent data take a required second parameter `consistency`.

- This parameter lets you either ignore eventual consistency or manage how your application interacts with it.

For example, if you search for a process instance immediately after you create it, the response may contain the new instance. If the data is not yet available, the search may return an empty result or a 404 error.

```typescript
import { createCamundaClient } from "@camunda8/orchestration-cluster-api";

const camunda = createCamundaClient();

async function main() {
  const deploymentResponse = await camunda.deployResourcesFromFile([
    "./process.bpmn",
  ]);
  const { processDefinitionKey } = deploymentResponse.processes[0];

  const { processInstanceKey } = await camunda.createProcessInstance({
    processDefinitionKey,
  });

  // May return the process instance, but more likely will return an empty set
  const runningProcessInstance = await camunda.searchProcessInstances(
    {
      filter: {
        processInstanceKey,
      },
    },
    { consistencyManagement: { waitUpToMs: 0 } }
  );
  console.log(JSON.stringify(runningProcessInstance, null, 2));
}

main();
```

To ignore eventual consistency, set `waitUpToMs` to 0. The operation returns immediately with the current API response.

In this scenario, you are more likely to receive an empty set for a search operation or a 404 error for a get operation than to find the process instance you just created. Even though the system already created the process instance and returned its key, you might still receive a result such as:

```json
{
  "items": []
}
```

In some situations, you may want to wait for eventual consistency to settle. The SDK provides you with an ergonomic surface for this.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/eventual-consistency
