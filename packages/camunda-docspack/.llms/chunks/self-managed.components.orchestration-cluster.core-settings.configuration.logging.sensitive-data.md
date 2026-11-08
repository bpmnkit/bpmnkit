# Logging — Sensitive data

By default, loggers that may handle sensitive information (e.g., variable values, actor names) are set to **INFO**.  
To capture more detail (DEBUG or TRACE), explicitly configure those loggers via their logger names or component-specific variables.

**Warning**
Enabling verbose logging may expose sensitive data. Use debug/trace levels only temporarily for troubleshooting.


## Best practices

- Always check the inline default configuration before customizing.
- Use component-specific `*_LOG_LEVEL` and `*_LOG_APPENDER` variables for fine-grained control.
- Select the Stackdriver appender only when you need JSON output; the console appender is simpler for stdout logs. Disable the RollingFile appender with `CAMUNDA_LOG_FILE_APPENDER_ENABLED=false` if you collect logs from stdout only.
- Monitor logging setup across environments (dev/test/prod) to avoid surprises caused by log verbosity.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging
