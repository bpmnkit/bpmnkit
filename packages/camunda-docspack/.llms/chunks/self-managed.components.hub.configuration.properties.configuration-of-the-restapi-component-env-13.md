# Property reference — Configuration of the `restapi` component — env

| Environment variable                                               | Description                                                                                     | Example value        | Default value                       |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------- |
| `MANAGEMENT_SERVER_PORT`                                           | [optional]Port for the management server (health and metrics endpoints).                   | `8091`               | `8091`                              |
| `MANAGEMENT_ENDPOINTS_ACCESS_DEFAULT`                              | [optional]Default access level for all actuator endpoints.                                 | `read-only`          | `none`                              |
| `MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE`                        | [optional]Comma-separated list of actuator endpoints to expose over the web.               | `health, prometheus` | `health, info, prometheus, loggers` |
| `MANAGEMENT_ENDPOINTS_WEB_BASE_PATH`                               | [optional]Base path for all web-exposed actuator endpoints.                                | `/actuator`          | `/`                                 |
| `MANAGEMENT_ENDPOINTS_WEB_PATH_MAPPING_HEALTH`                     | [optional]Custom path mapping for the health endpoint.                                     | `/health`            | `health`                            |
| `MANAGEMENT_ENDPOINTS_WEB_PATH_MAPPING_PROMETHEUS`                 | [optional]Custom path mapping for the Prometheus endpoint.                                 | `/prometheus`        | `metrics`                           |
| `MANAGEMENT_ENDPOINT_PROMETHEUS_ACCESS`                            | [optional]Access level for the Prometheus endpoint.                                        | `unrestricted`       | `read-only`                         |
| `MANAGEMENT_ENDPOINT_HEALTH_ACCESS`                                | [optional]Access level for the health endpoint.                                            | `unrestricted`       | `read-only`                         |
| `MANAGEMENT_ENDPOINT_HEALTH_PROBES_ENABLED`                        | [optional]Whether Kubernetes-style readiness and liveness probes are enabled.              | `true`               | `true`                              |
| `MANAGEMENT_ENDPOINT_HEALTH_GROUP_READINESS_ADDITIONAL_PATH`       | [optional]Expose the readiness probe on an additional path (e.g. on the main server port). | `server:/health`     | `server:/health`                    |
| `MANAGEMENT_ENDPOINT_INFO_ACCESS`                                  | [optional]Access level for the info endpoint.                                              | `unrestricted`       | `read-only`                         |
| `MANAGEMENT_ENDPOINT_LOGGERS_ACCESS`                               | [optional]Access level for the loggers endpoint.                                           | `read-only`          | `unrestricted`                      |
| `MANAGEMENT_INFO_GIT_ENABLED`                                      | [optional]Whether Git info is exposed via the info endpoint.                               | `true`               | `false`                             |
| `MANAGEMENT_HEALTH_DEFAULTS_ENABLED`                               | [optional]Whether default health indicators are enabled.                                   | `true`               | `false`                             |
| `MANAGEMENT_METRICS_DISTRIBUTION_PERCENTILES_HTTP_SERVER_REQUESTS` | [optional]Comma-separated list of percentiles to publish for HTTP server request metrics.  | `0.5, 0.9, 0.99`     | `0.5, 0.9, 0.99`                    |

#### Available endpoints

| Endpoint                         | Description        |
| -------------------------------- | ------------------ |
| `<server>:8091/metrics`          | Prometheus metrics |
| `<server>:8091/health/readiness` | Readiness probe    |
| `<server>:8091/health/liveness`  | Liveness probe     |

For more details, including Kubernetes probe configuration examples and `websocket` health endpoints, see the [Monitoring](https://docs.camunda.io/docs/next/self-managed/components/hub/monitoring) page.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
