# Property reference — Configuration of the `restapi` component — application.yaml

| Property                                                            | Description                                                                                     | Example value        | Default value                       |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------- |
| `management.server.port`                                            | [optional]Port for the management server (health and metrics endpoints).                   | `8091`               | `8091`                              |
| `management.endpoints.access.default`                               | [optional]Default access level for all actuator endpoints.                                 | `read-only`          | `none`                              |
| `management.endpoints.web.exposure.include`                         | [optional]Comma-separated list of actuator endpoints to expose over the web.               | `health, prometheus` | `health, info, prometheus, loggers` |
| `management.endpoints.web.base-path`                                | [optional]Base path for all web-exposed actuator endpoints.                                | `/actuator`          | `/`                                 |
| `management.endpoints.web.path-mapping.health`                      | [optional]Custom path mapping for the health endpoint.                                     | `health`             | `health`                            |
| `management.endpoints.web.path-mapping.prometheus`                  | [optional]Custom path mapping for the Prometheus endpoint.                                 | `prometheus`         | `metrics`                           |
| `management.endpoint.prometheus.access`                             | [optional]Access level for the Prometheus endpoint.                                        | `unrestricted`       | `read-only`                         |
| `management.endpoint.health.access`                                 | [optional]Access level for the health endpoint.                                            | `unrestricted`       | `read-only`                         |
| `management.endpoint.health.probes.enabled`                         | [optional]Whether Kubernetes-style readiness and liveness probes are enabled.              | `true`               | `true`                              |
| `management.endpoint.health.group.readiness.additional-path`        | [optional]Expose the readiness probe on an additional path (e.g. on the main server port). | `server:/health`     | `server:/health`                    |
| `management.endpoint.info.access`                                   | [optional]Access level for the info endpoint.                                              | `unrestricted`       | `read-only`                         |
| `management.endpoint.loggers.access`                                | [optional]Access level for the loggers endpoint.                                           | `read-only`          | `unrestricted`                      |
| `management.info.git.enabled`                                       | [optional]Whether Git info is exposed via the info endpoint.                               | `true`               | `false`                             |
| `management.health.defaults.enabled`                                | [optional]Whether default health indicators are enabled.                                   | `true`               | `false`                             |
| `management.metrics.distribution.percentiles[http.server.requests]` | [optional]Comma-separated list of percentiles to publish for HTTP server request metrics.  | `0.5, 0.9, 0.99`     | `0.5, 0.9, 0.99`                    |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
