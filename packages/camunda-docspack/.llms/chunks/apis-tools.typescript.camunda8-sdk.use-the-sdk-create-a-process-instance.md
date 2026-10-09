# TypeScript SDK — Use the SDK — Create a process instance

There are two options for creating a process instance:

- For long-running processes, use `createProcessInstance`. It returns as soon as the process instance is created with the process instance ID.
- For the shorter-running process we are using, set `awaitCompletion: true`. It awaits the completion of the process and returns with the final variable values.

1. Locate the following line in the `main` function:

   ```typescript
   console.log(
     `[Zeebe] Deployed process ${res.deployments[0].process.bpmnProcessId}`
   );
   ```

2. Inside the `main` function, add the following:

   ```typescript
   const result = await camunda.createProcessInstanceWithResult({
     processDefinitionId,
     variables: {
       userTaskStatus: "Needs doing",
     },
     awaitCompletion: true,
   });
   console.log(
     `[Camunda] Finished Process Instance ${result.processInstanceKey}`
   );
   console.log(
     `[Camunda] userTaskStatus is "${result.variables.userTaskStatus}"`
   );
   console.log(
     `[Camunda] serviceTaskOutcome is "${result.variables.serviceTaskOutcome}"`
   );
   worker.stop();
   userTaskPoller.catch((e) => e); // Swallow cancel exception
   userTaskPoller.cancel(); // Cancel poller to exit app
   ```

3. Run the program with the following command:

   ```bash
   npx tsx index.ts
   ```

You see output similar to the following:

```
[Camunda] Deployed process c8-sdk-demo
[worker]: Completing job 4503599632829668 from process 4503599632829662
[usertask poller]: Claiming task 4503599632829678 from process 4503599632829662
[usertask poller]: Completing user task 4503599632829678 from process 4503599632829662
[Camunda] Finished Process Instance 4503599632829662
[Camunda] userTaskStatus is "Got done"
[Camunda] serviceTaskOutcome is "We did it!"
```

The program continues running until you press `Ctrl+C` because both the service worker and the user task poller run in continuous loops.

To explore more SDK functionality, use the examples below.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/camunda8-sdk
