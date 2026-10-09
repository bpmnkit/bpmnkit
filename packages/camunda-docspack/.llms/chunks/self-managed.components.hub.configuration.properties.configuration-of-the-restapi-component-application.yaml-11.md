# Property reference — Configuration of the `restapi` component — application.yaml

| Property                           | Description                                         | Example value                                 | Default value |
| ---------------------------------- | --------------------------------------------------- | --------------------------------------------- | ------------- |
| `logging.config`                   | [optional]Path to custom Log4j2 configuration. | `file:/full/path/to/custom-log4j2-spring.xml` | -             |
| `camunda.hub.client.logging.level` | [optional]Log level for the client.            | `DEBUG`                                       | `WARN`        |

The `CAMUNDA_HUB_LOG_LEVEL`, `CAMUNDA_LOG_FILE_APPENDER_ENABLED`, and `CAMUNDA_HUB_LOG_APPENDER` settings are only available as environment variables.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
