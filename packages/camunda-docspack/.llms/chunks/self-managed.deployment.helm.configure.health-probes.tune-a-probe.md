# Configure health probes — Tune a probe

Set only the values you want to change. The chart keeps the defaults for all other values.

The following example enables the startup probe of the Orchestration Cluster. Kubernetes restarts the container if the probe fails 30 times in a row, 10 seconds apart. Until the startup probe succeeds, Kubernetes doesn't run the readiness and liveness probes.

```yaml
orchestration:
  startupProbe:
    enabled: true
    periodSeconds: 10
    failureThreshold: 30
```

To change a Camunda Hub probe, set the value under `camundaHub`. The following example raises the timeout of the Camunda Hub REST API readiness probe to five seconds:

```yaml
camundaHub:
  restapi:
    readinessProbe:
      timeoutSeconds: 5
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/health-probes
