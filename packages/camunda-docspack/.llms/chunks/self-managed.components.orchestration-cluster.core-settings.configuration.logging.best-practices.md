# Logging — Best practices

- Always check the inline default configuration before customizing.
- Use component-specific `*_LOG_LEVEL` and `*_LOG_APPENDER` variables for fine-grained control.
- Enable the RollingFile or Stackdriver appenders only when needed; console is simpler for stdout logs.
- Monitor logging setup across environments (dev/test/prod) to avoid surprises caused by log verbosity.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging
