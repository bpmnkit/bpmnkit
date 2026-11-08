# Quick Start — Step 3: Deploy to Camunda 8

When you're ready, run it on a real Camunda 8 cluster. In Camunda Hub, open **Console →
Clusters**, pick your cluster, and on its **API** tab click **Create new client**. Download the
credentials file it shows once. Then, from the CLI:

```sh
npx @bpmnkit/cli profile import saas ./camunda-credentials.sh
npx @bpmnkit/cli profile use saas
npx @bpmnkit/cli deploy deploy hello.bpmn --target camunda8
npx @bpmnkit/cli process-instance create --data '{"processDefinitionId":"hello","variables":{"greeting":"world"}}'
```

The instance waits at the `greet` task until a worker completes it — see
[Camunda 8 Deployment](/docs/guides/deployment#handling-jobs).

Or do the same from code. The base URL is your cluster's REST address with `/v2` on the end:
`ZEEBE_REST_ADDRESS` in the credentials file.

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
});

// Deploy the process definition
const form = new FormData();
form.append("resources", new Blob([xml]), "hello.bpmn");
await client.resource.createDeployment(form);

// Start a new process instance
const instance = await client.processInstance.createProcessInstance({
  processDefinitionId: "hello",
  variables: { greeting: "world" },
});

console.log("Started instance:", instance.processInstanceKey);
```

---
Source: https://bpmnkit.com/docs/getting-started/quick-start
