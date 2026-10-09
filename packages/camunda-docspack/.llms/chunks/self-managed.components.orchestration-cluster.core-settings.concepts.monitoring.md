# Monitoring

The Orchestration Cluster includes the Spring Boot Actuator, which provides health checks, metrics, and other monitoring endpoints out of the box.

The Orchestration Cluster includes the [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html#production-ready), which provides health checks, metrics, and other monitoring endpoints out of the box.


## Default configuration

By default, the Orchestration Cluster uses the following Actuator configuration (differences noted inline):

```yaml
# Disable default health indicators
# https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html#production-ready-health-indicators
management.health.defaults.enabled: false

# Enable Kubernetes health groups
# https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-features.html#production-ready-kubernetes-probes
management.health.probes.enabled: true # (Operate)
management.endpoint.health.probes.enabled: true # (Tasklist)

# Expose selected Actuator endpoints
management.endpoints.web.exposure.include: health, prometheus, loggers, usage-metrics, backup(s)
```

Operate uses `backup`, while Tasklist uses `backups`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/monitoring
