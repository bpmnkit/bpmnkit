# Logging — Pattern layout/format

- The default layout shows the full date and time, thread name, MDC context, log level, logger name, and message.

**Default pattern:**

```perl
[%d{yyyy-MM-dd HH:mm:ss.SSS}] [%t] %notEmpty{[%X] }%-5level \t%logger{36} - %msg%n
```


## Changing log level at runtime

You can adjust log levels dynamically using Spring Boot Actuator endpoints:

```bash
curl 'http://localhost:9600/actuator/loggers/io.camunda' \
  -i -X POST \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel":"DEBUG"}'
```

Replace `io.camunda` with the logger you want to adjust.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging
