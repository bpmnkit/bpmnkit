# TypeScript SDK — Use the SDK — Retrieve a process instance

When you create a long-running process instance, you typically use `createProcessInstance` and get back the process instance key of the running process immediately instead of waiting for it to complete.

To examine the process instance status, use the process instance key to query the Operate API. You can also check completed process instances in the same way. In the following example, you query the process instance created earlier.

1. Locate the following line in the `main` function:

   ```typescript
   console.log(
     `[Camunda] serviceTaskOutcome is "${result.variables.serviceTaskOutcome}"`
   );
   ```

2. Add the following after this line and inside the `main` function:

   ```typescript
   const historicalProcessInstance = await camunda.getProcessInstance(
     {
       processInstanceKey: result.processInstanceKey,
     },
     { consistency: { waitUpToMs: 5000 } }
   );
   console.log("[Camunda]", JSON.stringify(historicalProcessInstance, null, 2));
   ```

When you run the program now, you should see additional output similar to the following:

```
{
  processInstanceKey: 4503599632829662,
  processVersion: 1,
  processDefinitionId: 'c8-sdk-demo',
  startDate: '2025-11-08T09:11:06.157+0000',
  endDate: '2025-11-08T09:11:12.403+0000',
  state: 'COMPLETED',
  processDefinitionKey: 2251799814900879,
}
```

The state may appear as `ACTIVE` rather than `COMPLETED`. This happens because the data read over the API is historical data from the Zeebe exporter, and lags behind the actual state of the system. It is _eventually consistent_.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/camunda8-sdk
