# Writing good workers — Write idempotent workers

Zeebe uses an **at-least-once** execution strategy for jobs. A job is only completed when the engine receives and commits the complete job request. If a worker crashes, loses its connection, or exceeds the [job timeout](https://docs.camunda.io/docs/next/components/concepts/job-workers#timeouts) before it can complete the job, the engine gives the job to another worker. This guarantees that the job handler runs at least once, but it also means the handler can run more than once for the same job, possibly with side effects already applied.

**Warning**
Your workers **must** be idempotent. Running the handler more than once for the same job must leave the application in the same state as running it once. Non-idempotent workers can cause duplicate payments, duplicate orders, or other inconsistent data.

Make idempotency a conscious design decision for every worker, not an afterthought. Strategies include:

- **Natural idempotency**: some operations can safely run any number of times because they only set state, for example `confirmCustomer()`.
- **Business idempotency**: use a business identifier to detect duplicate calls, for example `createCustomer(email)`.
- **Custom idempotency handling**: generate a unique ID or hash, pass it with the call, and let the target system reject duplicates, for example `charge(transactionId, amount)`.

To learn how workers handle transactions, exceptions, and custom idempotency, see [Deal with problems and exceptions](https://docs.camunda.io/docs/next/components/best-practices/development/dealing-with-problems-and-exceptions#writing-idempotent-workers).

---
Source: https://docs.camunda.io/docs/next/components/best-practices/development/writing-good-workers
