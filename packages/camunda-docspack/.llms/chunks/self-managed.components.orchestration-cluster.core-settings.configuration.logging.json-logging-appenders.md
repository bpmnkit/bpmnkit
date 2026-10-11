# Logging — JSON logging appenders

| Appender           | Description                                        | Enable / Variable                                      |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------ |
| Console            | Standard text output                               | `*_LOG_APPENDER=Console`                               |
| Stackdriver (JSON) | JSON output for Google Cloud / Stackdriver         | `*_LOG_APPENDER=Stackdriver`                           |
| RollingFile        | Writes logs to a rotating file, enabled by default | Disable with `CAMUNDA_LOG_FILE_APPENDER_ENABLED=false` |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging
