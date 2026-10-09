# Migrate to the Orchestration Cluster API — Integrate the loosely-typed client

The SDK provides a legacy-compatible loosely-typed client. This erases the domain typing (all fields remain type `string`). This enables you to use the new client without managing type interaction with your existing code.

```typescript
import { Camunda8, OrchestrationLifters } from '@camunda8/sdk'

const factory = new Camunda8()
const camunda = new factory.getOrchestrationClusterApiClientLoose()
const legacyCamunda = new factory.getCamundaRestClient()

async function main() {
    const deploymentResponse = await legacyCamunda.deployResourcesFromFile(['./process.bpmn'])
    const { processDefinitionKey } = deploymentResponse.processes[0]

    const {processInstanceKey} = await legacyCamunda.createProcessInstance({ processDefinitionKey }) // string

    const
    const runningProcessInstance = await camunda.searchProcessInstances({
        filter: {
            processInstanceKey // accepts string type
        }
    }, { consistencyManagement: { waitUpToMs: 10_000 } })
}

main()
```

You can use loosely-typed in the first instance, then progressively migrate to the strongly typed variant.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/migrating-to-oca
