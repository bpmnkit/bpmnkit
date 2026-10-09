# TypeScript SDK — Use the SDK — Create a programmatic user task worker

The process has a [user task](https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks) after the service task. The service task worker completes the service task job. You complete the user task using the Tasklist API client.

Add the following code below the service worker:

```typescript
// User task poller
const last = new Set<OrchestrationLifters.UserTaskKey>();
const userTaskPoller = camunda.searchUserTasks(
  {
    filter: {
      state: "CREATED",
    },
  },
  {
    // To set up a subscription, set waitUpToMs to Infinity
    consistency: {
      waitUpToMs: Infinity,
      pollIntervalMs: 1_000,
      // predicate now becomes a polling subscription function
      predicate: async (results) => {
        // polling memoization - handles idempotency with eventually consistent mutation
        const current = results.items.filter(
          (item) => !last.has(item.userTaskKey)
        );
        last.clear();
        results.items.forEach((task) => last.add(task.userTaskKey));
        for (const userTask of current) {
          console.log(
            `[usertask poller]: Claiming task ${userTask.userTaskKey} from process ${userTask.processInstanceKey}\n`
          );
          await camunda.assignUserTask({
            userTaskKey: userTask.userTaskKey,
            assignee: "jwulf",
          });

          console.log(
            `[usertask poller]: Completing user task ${userTask.userTaskKey} from process ${userTask.processInstanceKey}\n`
          );
          await camunda.completeUserTask({
            userTaskKey: userTask.userTaskKey,
            variables: {
              userTaskStatus: "Got done",
            },
          });
        }
        return false; // return false to keep polling
      },
    },
  }
);
```

You now have an asynchronously polling service and user task worker.

The final step is to create a process instance.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/camunda8-sdk
