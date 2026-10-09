# Logging — Changing log level at runtime

You can adjust log levels dynamically using Spring Boot Actuator endpoints:

```bash
curl 'http://localhost:9600/actuator/loggers/io.camunda' \
  -i -X POST \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel":"DEBUG"}'
```

Replace `io.camunda` with the logger you want to adjust.


## Sensitive data

By default, loggers that may handle sensitive information (e.g., variable values, actor names) are set to **INFO**.  
To capture more detail (DEBUG or TRACE), explicitly configure those loggers via their logger names or component-specific variables.

**Warning**
Enabling verbose logging may expose sensitive data. Use debug/trace levels only temporarily for troubleshooting.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging
