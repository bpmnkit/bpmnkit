# Manage Orchestration Cluster API data consistency — Manage eventual consistency

If `waitUpToMs` is set to a value greater than `0` (for example, `10_000`), the SDK polls every 500 ms for up to that duration and returns a value as soon as one is available.

For search operations, this is when the result set has a length > 0. For get operations, it is when the API returns 200 rather than 404.

If no results appear within the specified time, the operation will throw an `EventualConsistencyTimeoutError`.

This means eventually consistent operations return either a value or an error:

```typescript
// get, 0: Value or 'NOT_FOUND' exception
await camunda.getProcessInstance(
  {
    processInstanceKey,
  },
  { consistency: { waitForMs: 0 } }
);

// get, > 0: Value or EventualConsistencyTimeoutError
await camunda.getProcessInstance(
  {
    processInstanceKey,
  },
  { consistency: { waitForMs: 1_000 } }
);

// search, 0: Value, including empty set
await camunda.searchProcessInstances(
  {
    processInstanceKey,
  },
  { consistency: { waitForMs: 0 } }
);

// search, >0: Expected value or EventualConsistencyTimeoutError
await camunda.searchProcessInstances(
  {
    processInstanceKey,
  },
  { consistency: { waitForMs: 1_000 } }
);
```

Change the polling interval using the `pollIntervalMs` parameter.

For query operations, optionally provide a custom predicate via the `predicate` parameter. The predicate function receives the current result set, and returns a boolean: `false` to continue polling or `true` to accept and propagate the current results. You can use this for advanced client-side filtering or to build a subscription mechanism.

Eventually consistent operations return a cancelable promise. Calling `cancel` stops polling and cancels any in-flight network operation, then throws a `CancelSdkError`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/eventual-consistency
