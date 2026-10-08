# Get exporting status of the whole cluster

`GET /cluster/v2/exporting`

Returns the exporting status of the whole cluster, folded over the exporting status of every physical tenant. Only `PAUSED` and `SOFT_PAUSED` confirm that exporting is paused cluster-wide; every other value means at least one physical tenant is not paused, so callers should keep polling. A physical tenant that itself reports `MIXED` makes the whole cluster `MIXED`.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Responses:
  200 ExportingStatusResponse — The aggregated exporting status of the whole cluster.
  401 ProblemDetail — The request lacks valid authentication credentials.
  403 ProblemDetail — Forbidden. The request is not allowed.
  500 ProblemDetail — An internal error occurred while processing the request.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-cluster-exporting-status.api
