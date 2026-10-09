# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Pin the Hub WebSocket secrets

The migration runs `helm upgrade` three times. If you don't set the Pusher secrets, the chart generates new random values on every upgrade. The REST API and WebSockets pods read these values only when they start. Therefore, a pod that restarts after a later upgrade can have different values from the other pod. Different values in the two pods break WebSocket authentication.

Before you start, create a Kubernetes Secret that holds both values. Then reference the Secret. Any values work, because the REST API and WebSockets pods read the same Secret. The Secret must exist with the named keys before the first `helm upgrade`. The Hub pods don't start without the Secret.

```yaml
camundaHub:
  restapi:
    pusher:
      secret:
        existingSecret: camunda-hub-pusher
        existingSecretKey: app-secret
      client:
        secret:
          existingSecret: camunda-hub-pusher
          existingSecretKey: app-key
```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
