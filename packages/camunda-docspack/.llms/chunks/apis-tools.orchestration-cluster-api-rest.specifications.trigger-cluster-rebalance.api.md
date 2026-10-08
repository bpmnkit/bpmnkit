# Trigger a cluster-wide leadership rebalance

`POST /cluster/v2/rebalance`

Transfers leadership of every partition that is not led by its highest-priority replica towards that replica, one partition at a time. Returns as soon as the rebalance has been accepted (poll `GET /cluster/v2/rebalance` to monitor progress).

Each rebalance can specify overrides for the configured rebalance settings (e.g. maximum replication lag to allow). An absent request body means "use the configured settings".

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  dryRun (query, boolean)

Request body:
  application/json: ClusterRebalanceRequest
    replicationLagThreshold (integer) — The highest replication lag (in bytes) that a desired leader may have for its transfer to be accepted.
    replicationTimeout (string) — How long a partition may stay frozen waiting for its desired leader to catch up (as a positive ISO-8601 duration).
    maxTransferAttempts (integer) — How many times a current leader may prompt the desired leader to take over leadership before giving up.
    leaderWaitTimeout (string) — How long the coordinator waits for a partition without a leader to acquire one before reporting `NO_LEADER` and moving on (as a positive ISO-8601 duration).

Responses:
  202 ClusterBalanceResponse — The rebalance was accepted, and its status is reported as it starts.
  400 ProblemDetail — The provided data is not valid.
  401 ProblemDetail — The request lacks valid authentication credentials.
  409 ProblemDetail — A rebalance or cluster configuration change is already in progress, so there is no settled configuration to plan a rebalance against.
  500 ProblemDetail — An internal error occurred while processing the request.
  502 ProblemDetail — The coordinator was reached, but its response was absent or unusable.
  503 ProblemDetail — No coordinator is currently available or reachable.
  504 ProblemDetail — The coordinator did not answer before the request timeout.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/trigger-cluster-rebalance.api
