# @bpmnkit/api — Process Operations

```typescript
// Deploy: a multipart upload, one `resources` part per file
const form = new FormData();
form.append("resources", new Blob([bpmnXml]), "my-flow.bpmn");
await client.resource.createDeployment(form);

// Start instance
const instance = await client.processInstance.createProcessInstance({
  processDefinitionId: "my-flow",
  variables: { customerId: "cust-001" },
});

// List active instances
const { items } = await client.processInstance.searchProcessInstances({
  filter: { processDefinitionId: "my-flow", state: "ACTIVE" },
});

// Cancel instance
await client.processInstance.cancelProcessInstance(instance.processInstanceKey);
```


## Job Workers

For a long-running worker, use [`@bpmnkit/worker-client`](/docs/guides/deployment#handling-jobs).
To handle a batch of jobs yourself:

```typescript
const { jobs } = await client.job.activateJobs({
  type: "send-email",
  maxJobsToActivate: 10,
  timeout: 60_000,          // job lock duration in ms
  worker: "email-worker-1",
});

for (const job of jobs) {
  try {
    await sendEmail(job.variables);
    await client.job.completeJob(job.jobKey, { variables: { emailSent: true } });
  } catch (err) {
    await client.job.failJob(job.jobKey, {
      errorMessage: String(err),
      retries: job.retries - 1,
    });
  }
}
```

---
Source: https://bpmnkit.com/docs/packages/api
