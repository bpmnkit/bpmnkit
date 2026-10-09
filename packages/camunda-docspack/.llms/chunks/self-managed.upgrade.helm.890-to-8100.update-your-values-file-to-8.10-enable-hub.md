# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Enable Hub

Console and Web Modeler are no longer standalone deployments. The `camunda/hub` image serves both feature sets.

Replace the legacy enablement keys with `camundaHub.enabled`, and move overrides directly under `camundaHub`:

```yaml
# Before (8.9)
console:
  enabled: true
webModeler:
  enabled: true
  restapi:
    resources:
      requests:
        memory: 1Gi

# After (8.10)
camundaHub:
  enabled: true
  restapi:
    resources:
      requests:
        memory: 1Gi
```

The legacy `console.enabled` and `webModeler.enabled` keys remain compatibility shims in 8.10 and emit deprecation warnings.

If you mirror or pin images, update these repositories:

| 8.9 image                              | 8.10 image                      |
| :------------------------------------- | :------------------------------ |
| `camunda/web-modeler-restapi:8.9.x`    | `camunda/hub:8.10.x`            |
| `camunda/web-modeler-websockets:8.9.x` | `camunda/hub-websockets:8.10.x` |

The standalone `camunda/console` image is no longer deployed. Configure the Hub repositories under `camundaHub.restapi.image.repository` and `camundaHub.websockets.image.repository`.

Because Console now runs in the Hub REST API pod, review `camundaHub.restapi.resources` after upgrading and adjust the requests and limits if the pod is throttled or runs out of memory.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
