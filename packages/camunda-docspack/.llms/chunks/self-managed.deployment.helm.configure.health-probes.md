# Configure health probes

Turn the startup, readiness, and liveness probes of Camunda components on or off, and change their endpoint and timing with Helm values.

Each Camunda component in the Helm chart has `startupProbe`, `readinessProbe`, and `livenessProbe` values. With these values, you can turn a probe on or off and change its endpoint or timing.

By default, the chart enables only the readiness probe of each component. The startup and liveness probes are off.


## Default probe endpoints

For each probe, Kubernetes sends an HTTP GET request to a container port and path. The following table lists the values prefix, the default port, and the default `probePath` of each probe.

| Component              | Values prefix           | Port   | Startup `probePath`          | Readiness `probePath`        | Liveness `probePath`        |
| ---------------------- | ----------------------- | ------ | ---------------------------- | ---------------------------- | --------------------------- |
| Orchestration Cluster  | `orchestration`         | `9600` | `/actuator/health/startup`   | `/actuator/health/readiness` | `/actuator/health/liveness` |
| Management Identity    | `identity`              | `8082` | `/actuator/health`           | `/actuator/health`           | `/actuator/health`          |
| Connectors             | `connectors`            | `8080` | `/actuator/health/readiness` | `/actuator/health/readiness` | `/actuator/health/liveness` |
| Optimize               | `optimize`              | `8090` | `/api/readyz`                | `/api/readyz`                | `/api/readyz`               |
| Camunda Hub REST API   | `camundaHub.restapi`    | `8091` | `/health/liveness`           | `/health/readiness`          | `/health/liveness`          |
| Camunda Hub WebSockets | `camundaHub.websockets` | `8060` | `/up`                        | `/up`                        | `/up`                       |

The following rules apply:

- The `scheme` value defaults to `HTTP`. For Connectors and Optimize, the default is empty. When you enable TLS for the component, the chart uses `HTTPS` for an empty `scheme`. Otherwise, it uses `HTTP`. See [Connectors TLS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes#connectors-tls) and [Optimize TLS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes#optimize-tls).
- The Orchestration Cluster, Connectors, Optimize, and Camunda Hub REST API probes use the `contextPath` value of the component as a path prefix. For Camunda Hub, that value is `camundaHub.contextPath`. Management Identity and Camunda Hub WebSockets probes use `probePath` only.
- Camunda Hub inherits its probe defaults from the `webModeler.restapi` and `webModeler.websockets` values. Values you set under `camundaHub.restapi` and `camundaHub.websockets` take precedence. The chart merges both sets of values key by key. You set only the keys you want to change.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/health-probes
