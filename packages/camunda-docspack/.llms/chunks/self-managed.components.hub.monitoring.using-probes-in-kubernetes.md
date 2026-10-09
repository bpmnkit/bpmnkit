# Monitoring — Using probes in Kubernetes

For details on setting Kubernetes probe parameters, see [Kubernetes configure probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#configure-probes).

**Readiness probe:**

```yaml
readinessProbe:
  httpGet:
    path: /health/readiness
    port: 8091
  initialDelaySeconds: 30
  periodSeconds: 30
```

**Liveness probe:**

```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 8091
  initialDelaySeconds: 30
  periodSeconds: 30
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/monitoring
