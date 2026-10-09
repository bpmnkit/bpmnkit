# Logging — Changing log level at runtime

You can adjust log levels dynamically using Spring Boot Actuator [`loggers`](https://docs.spring.io/spring-boot/api/rest/actuator/loggers.html) endpoints:

```bash
curl 'http://localhost:8091/actuator/loggers/io.camunda' \
  -i -X POST \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel":"DEBUG"}'
```

Replace `io.camunda` with the logger you want to adjust.

**Note**
The base URL may differ depending on your environment configuration. The example above assumes execution from the same host running the Camunda Hub `restapi` component. This URL is only callable via the [management port](https://docs.spring.io/spring-boot/reference/actuator/monitoring.html#actuator.monitoring.customizing-management-server-port), usually not publicly available.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging
