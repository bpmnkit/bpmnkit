# Set up the Cluster Metrics endpoint — Authentication and IP allowlisting

The Cluster Metrics endpoint enforces both authentication and network restrictions.

| Restriction     | Description                                                                                                                                                                                                                                                                                                      |
| :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication  | The endpoint uses Basic authentication.                                                                                                                                                                                                                                                                          |
| IP allowlisting | The endpoint enforces the cluster-level IP allowlist. Requests from non-allowlisted IP addresses are rejected.If an IP allowlist is configured for the cluster, you must add the source IP addresses of your monitoring system to the allowlist to access the endpoint. |

### Error responses

The Cluster Metrics endpoint returns standard HTTP status codes to indicate access and availability issues:

| Scenario                                       | HTTP status code          |
| :--------------------------------------------- | :------------------------ |
| Request from a non-allowlisted IP address.     | `403 Forbidden`           |
| Invalid or missing authentication credentials. | `401 Unauthorized`        |
| Request rate exceeds allowed limits.           | `429 Too Many Requests`   |
| Metrics endpoint is temporarily unavailable.   | `503 Service Unavailable` |
| Request times out due to high load.            | `504 Gateway Timeout`     |

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/set-up-cluster-metrics-endpoint
