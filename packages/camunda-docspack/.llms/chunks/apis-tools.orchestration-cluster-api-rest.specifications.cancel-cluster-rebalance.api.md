# Stop the running rebalance

`DELETE /cluster/v2/rebalance`

Asks the running rebalance to stop once the transfer in flight has finished. Partitions already transferred keep their new leaders, and those the rebalance had not yet reached keep their current ones.

Cancellation requests are idempotent and always accepted. The `wasRunning` response field can be used to distinguish a cancellation that found a running rebalance from one that did not.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Responses:
  200 RebalanceCancellationResponse — The cancellation was accepted.
  401 ProblemDetail — The request lacks valid authentication credentials.
  500 ProblemDetail — An internal error occurred while processing the request.
  502 ProblemDetail — The coordinator was reached, but its response was absent or unusable.
  503 ProblemDetail — No coordinator is currently available or reachable.
  504 ProblemDetail — The coordinator did not answer before the request timeout.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/cancel-cluster-rebalance.api
