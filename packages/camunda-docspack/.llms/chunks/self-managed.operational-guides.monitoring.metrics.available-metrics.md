# Camunda components metrics — Available metrics

[Spring already exposes various metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html#actuator.metrics.supported), some of which will be made available
through Camunda:

- [JVM metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html#actuator.metrics.supported.jvm)
- [System metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html#actuator.metrics.supported.system)
- [Application startup metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html#actuator.metrics.supported.application-startup)
- [Logger metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html#actuator.metrics.supported.logger)
- [Spring MVC metrics](https://docs.spring.io/spring-boot/reference/actuator/metrics.html#actuator.metrics.supported.spring-mvc)

Camunda also exposes several custom metrics, most of them under the `zeebe`, `atomix`, `operate`, `tasklist`, or `optimize` prefixes.

**Note**
While all nodes in a Camunda cluster expose metrics, they will expose relevant metrics based on their role. For example, brokers will expose processing related metrics,
while gateways will expose REST API relevant metrics.

**Note**
**Not all metrics are available at all times.** This can apply to various metrics, but is especially noticeable for **processing-related metrics**, which are recorded on events that can occur infrequently. For example, the `zeebe_incident_events_total` metric is only recorded when an incident is **created** or **resolved**.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
