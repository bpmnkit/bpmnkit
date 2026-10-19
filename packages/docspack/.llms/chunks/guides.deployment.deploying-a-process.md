# Camunda 8 Deployment — Deploying a Process

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

---
Source: https://bpmnkit.com/docs/guides/deployment
