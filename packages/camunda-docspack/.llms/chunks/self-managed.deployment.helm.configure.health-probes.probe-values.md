# Configure health probes — Probe values

Every probe accepts the same values. The key of a value has three parts: the values prefix from [Default probe endpoints](#default-probe-endpoints), the probe name, and the value name. For example, `orchestration.readinessProbe.periodSeconds`.

| Value                 | Default                                                                     | Description                                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`             | `false` for `startupProbe` and `livenessProbe`, `true` for `readinessProbe` | Adds the probe to the container when `true`.                                                                                                 |
| `scheme`              | `HTTP`. Empty for Connectors and Optimize.                                  | Protocol of the request, `HTTP` or `HTTPS`.                                                                                                  |
| `probePath`           | See [Default probe endpoints](#default-probe-endpoints).                    | Path of the request.                                                                                                                         |
| `initialDelaySeconds` | `30`. `10` for Camunda Hub WebSockets.                                      | Seconds to wait after the container starts before the first probe.                                                                           |
| `periodSeconds`       | `30`                                                                        | Seconds between probes.                                                                                                                      |
| `successThreshold`    | `1`                                                                         | Consecutive successes that mark the probe as successful again after a failure.                                                               |
| `failureThreshold`    | `5`                                                                         | Consecutive failures before Kubernetes marks the pod as not ready (readiness probe) or restarts the container (startup and liveness probes). |
| `timeoutSeconds`      | `1`                                                                         | Seconds after which a probe request counts as failed.                                                                                        |

The timing values match the fields of the same name in the [Kubernetes probe configuration](https://kubernetes.io/docs/concepts/workloads/pods/probes/#configure-probes).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/health-probes
