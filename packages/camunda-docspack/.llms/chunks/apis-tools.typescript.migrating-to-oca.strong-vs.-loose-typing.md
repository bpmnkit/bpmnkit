# Migrate to the Orchestration Cluster API — Strong vs. loose typing

A feature of the Orchestration Cluster API is strong domain types. Request and response fields such as `ProcessDefinitionKey` and `ProcessDefinitionId` are distinct types, leading to better static analysis, enhanced IDE completion, more powerful refactoring, and early detection of runtime bugs.

The client implements this using [nominal typing](https://en.wikipedia.org/wiki/Nominal_type_system). You can pass a `ProcessDefinitionId` wherever a string is expected, but cannot pass a free string or a `ProcessDefinitionKey` where a `ProcessDefinitionId` is expected — even though structurally they are all type `string`.

```typescript
import { Camunda8 } from "@camunda8/sdk";

const camunda = new Camunda8().getOrchestrationClusterApiClient();

async function main() {
  const deploymentResponse = await camunda.deployResourcesFromFile([
    "./process.bpmn",
  ]);
  const { processDefinitionKey } = deploymentResponse.processes[0]; // nominal type is ProcessDefinitionKey
  console.log(typeof processDefinitionKey); // works — structural type is 'string'
  await camunda.createProcessInstance({
    processDefinitionId: processDefinitionKey,
  }); // error — incompatible types
}

main();
```

This approach makes output from the Orchestration Cluster API client compatible with input fields of earlier clients, but the reverse is not true. The earlier clients accept the structural types of the new client, and do not examine the nominal types at all.

```typescript
import { Camunda8 } from "@camunda8/sdk";

const factory = new Camunda8();
const camunda = new factory.getOrchestrationClusterApiClient();
const camundaLegacy = new factory.getCamundaRestClient();

async function main() {
  const deploymentResponse = await camunda.deployResourcesFromFile([
    "./process.bpmn",
  ]);
  const { processDefinitionKey } = deploymentResponse.processes[0]; // nominal type is ProcessDefinitionKey
  console.log(typeof processDefinitionKey); // structural type is 'string'

  const { processInstanceKey } = await camundaLegacy.createProcessInstance({
    processDefinitionKey,
  }); // works — structural type is string

  const runningProcessInstance = await camunda.searchProcessInstances(
    {
      filter: {
        processInstanceKey, // fails — legacy type is `string`, client requires `ProcessInstanceKey`
      },
    },
    { consistencyManagement: { waitUpToMs: 10_000 } }
  );
}

main();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/migrating-to-oca
