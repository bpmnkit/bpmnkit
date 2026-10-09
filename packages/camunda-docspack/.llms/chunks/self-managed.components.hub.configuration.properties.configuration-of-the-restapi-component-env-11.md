# Property reference — Configuration of the `restapi` component — env

| Environment variable                | Description                                                          | Example value                                 | Default value |
| ----------------------------------- | -------------------------------------------------------------------- | --------------------------------------------- | ------------- |
| `LOGGING_CONFIG`                    | [optional]Path to custom Log4j2 configuration.                  | `file:/full/path/to/custom-log4j2-spring.xml` | -             |
| `CAMUNDA_HUB_LOG_LEVEL`             | [optional]Defines the log level for the Camunda Hub components. | `DEBUG`                                       | `INFO`        |
| `CAMUNDA_LOG_FILE_APPENDER_ENABLED` | [optional]To enable logging to a file.                          | `true`                                        | `false`       |
| `CAMUNDA_HUB_LOG_APPENDER`          | [optional]Defines which appender to use for logging.            | `Stackdriver`                                 | `Console`     |
| `CAMUNDA_HUB_CLIENT_LOGGING_LEVEL`  | [optional]Log level for the client.                             | `DEBUG`                                       | `WARN`        |

Refer to the [advanced logging configuration guide](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging#logging-configuration-for-the-restapi-component) for additional details on how to customize the `restapi` logging output.

**Info**

- For log level options, see [understanding log levels](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/log-levels#understanding-log-levels).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
