# Report the cluster's current leadership balance

`GET /cluster/v2/rebalance`

Reports whether the cluster is currently balanced, the current leadership state of every partition, and what became of the last rebalance to finish. The last completed rebalance is held in memory by the coordinating broker, so none will be reported if the coordinator has moved or restarted since the last rebalance.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Responses:
  200 ClusterBalanceResponse — The cluster's current leadership balance.
  401 ProblemDetail — The request lacks valid authentication credentials.
  500 ProblemDetail — An internal error occurred while processing the request.
  502 ProblemDetail — The coordinator was reached, but its response was absent or unusable.
  503 ProblemDetail — No coordinator is currently available or reachable.
  504 ProblemDetail — The coordinator did not answer before the request timeout.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-cluster-rebalance.api
