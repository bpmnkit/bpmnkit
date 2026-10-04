# Cancel process instances (batch)

`POST /process-instances/cancellation`

Cancels multiple active or suspended process instances.
Only ACTIVE and SUSPENDED root instances can be cancelled. A state filter narrows the batch
to the given states. Requesting any state other than ACTIVE or SUSPENDED through the `$eq` or
`$in` operators is rejected. Other state operators (`$neq`, `$exists`, `$like`) are applied as
given, and the batch remains limited to ACTIVE and SUSPENDED instances. Without a state filter,
both ACTIVE and SUSPENDED instances are selected. Any given filter for parentProcessInstanceKey
is ignored and overridden during this batch operation.
This is done asynchronously, the progress can be tracked using the batchOperationKey from the response and the batch operation status endpoint (/batch-operations/{batchOperationKey}).

- Added in Camunda 8.8.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Request body:
  application/json: ProcessInstanceCancellationBatchOperationRequest (required)
    filter (ProcessInstanceFilter, required) — The process instance filter.
    operationReference (OperationReference)

Responses:
  200 BatchOperationCreatedResult — The batch operation request was created.
  400 ProblemDetail — The process instance batch operation failed. More details are provided in the response body.
  401 ProblemDetail — The request lacks valid authentication credentials.
  403 ProblemDetail — Forbidden. The request is not allowed.
  500 ProblemDetail — An internal error occurred while processing the request.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/cancel-process-instances-batch-operation.api
