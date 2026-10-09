# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
management:
  server:
    port: 8091

  endpoints:
    access:
      default: none
    web:
      exposure:
        include: health, info, prometheus, loggers
      base-path: /
      path-mapping:
        health: health
        prometheus: metrics

  endpoint:
    prometheus:
      access: read-only
    health:
      access: read-only
      probes:
        enabled: true
      # make readiness endpoint additionally available on main server port, so that it gets publicly exposed
      group:
        readiness:
          additional-path: "server:/health"
    info:
      access: read-only
    loggers:
      access: unrestricted
  info:
    git:
      enabled: false

  health:
    defaults:
      enabled: false

  metrics:
    distribution:
      percentiles:
        http.server.requests:
          - 0.5
          - 0.9
          - 0.99
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
