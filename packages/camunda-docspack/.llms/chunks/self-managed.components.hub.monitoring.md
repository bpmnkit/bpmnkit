# Monitoring

Camunda Hub provides health check and metrics endpoints for monitoring the restapi and websocket components in Self-Managed deployments.

Camunda Hub Self-Managed consists of two components (`restapi` and `websocket`), each exposing their own endpoints for health monitoring and metrics collection.

For configuration details, including the default Actuator settings and the management port, see the [Monitoring and health probes](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#monitoring) section on the configuration page.


## Available endpoints

### `restapi`

The `restapi` component is a Spring Boot application that includes the [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html#production-ready), providing health check and metrics endpoints out of the box.
These endpoints are served on a separate management port (default: `8091`). You can configure it with the [`management.server.port`](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#monitoring) property or the `MANAGEMENT_SERVER_PORT` environment variable.

| Endpoint                         | Description        |
| -------------------------------- | ------------------ |
| `<server>:8091/metrics`          | Prometheus metrics |
| `<server>:8091/health/readiness` | Readiness probe    |
| `<server>:8091/health/liveness`  | Liveness probe     |

### `websocket`

The `websocket` component provides a basic health check endpoint on its default application port (`8060`).

| Endpoint           | Description  |
| ------------------ | ------------ |
| `<server>:8060/up` | Health check |

**Note**
The `websocket` component does not expose a metrics endpoint.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/monitoring
