# Monitoring — Available endpoints

With this configuration, the following endpoints are available in the Orchestration Cluster:

- `<server>:9600/actuator/prometheus` – Prometheus metrics
- `<server>:9600/actuator/health/liveness` – Liveness probe
- `<server>:9600/actuator/health/readiness` – Readiness probe

You can override these defaults by adjusting the configuration parameters.


## Using probes in Kubernetes

For details on setting Kubernetes probe parameters, see [Kubernetes configure probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes).

**Readiness probe:**

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 9600
  initialDelaySeconds: 30
  periodSeconds: 30
```

**Liveness probe:**

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 9600
  initialDelaySeconds: 30
  periodSeconds: 30
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/monitoring
