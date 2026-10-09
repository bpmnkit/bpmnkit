# Migrate to the Orchestration Cluster API — Integrate the strongly typed client

To handle this, you can either manage the type system boundary or erase nominal typing.

The new client provides lifters to deal with interoperability. For example:

```typescript
import { Camunda8, OrchestrationLifters } from '@camunda8/sdk'

const factory = new Camunda8()
const camunda = new factory.getOrchestrationClusterApiClient()
const legacyCamunda = new factory.getCamundaRestClient()

async function main() {
    const deploymentResponse = await legacyCamunda.deployResourcesFromFile(['./process.bpmn'])
    const { processDefinitionKey } = deploymentResponse.processes[0]
    console.log(typeof processDefinitionKey) // structural type is 'string'

    const {processInstanceKey} = await legacyCamunda.createProcessInstance({ processDefinitionKey }) // works — structural type is string

    const
    const runningProcessInstance = await camunda.searchProcessInstances({
        filter: {
            processInstanceKey: processInstanceKey as OrchestrationLifters.ProcessInstanceKey // cast to `ProcessInstanceKey`
        }
    }, { consistencyManagement: { waitUpToMs: 10_000 } })
}

main()
```

Rather than casting in multiple places, you can do it once via assignment with the `assumeExists` lifter. The lifter will cast the type and also apply runtime constraint validation.

```typescript
import { Camunda8, OrchestrationLifters } from "@camunda8/sdk";

const camunda = new Camunda8().getOrchestrationClusterApi();

async function cancelRunningProcessInstances(processDefinitionKey: string) {
  // lift to nominal type `ProcessInstanceKey`. Will throw if passed invalid format.
  const _processDefinitionKey =
    OrchestrationLifters.ProcessDefinitionKey.assumeExists(
      processDefinitionKey
    );

  const processes = await camunda.searchProcessInstances(
    {
      filter: {
        processDefinitionKey: _processDefinitionKey,
      },
    },
    { consistencyManagement: { waitUpToMs: 10_000 } }
  );
  for (const process in processes.items) {
    await camunda.cancelProcess(process.processInstanceKey);
  }
}
```

**Info**
This approach is the preferred method. This allows you to move the type and constraint validation boundary from the server API to the boundaries of your application. See [the presentation on patterns](https://www.camundacon.com/event-session/camundacon-new-york-2025/patterns-to-use-today-to-make-camunda-8-apps-even-more-reliable?on_demand=true) for more information (refer to the third demo).

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/migrating-to-oca
