# Configure logging — General configuration options

Identity provides support for configuring the log level:

| Environment variable | Accepted values                                  |
| -------------------- | ------------------------------------------------ |
| `IDENTITY_LOG_LEVEL` | OFF, FATAL, ERROR, WARN, INFO, DEBUG, TRACE, ALL |


## Supported logging outputs

As part of configuration, Identity provides multiple appenders for outputting logs.

To configure which logging appender is used, set the `IDENTITY_LOG_APPENDER` environment variable to either `Console`, `Stackdriver`, or `File`.

### `Console`

Console logging produces messages to standard output and is the default log appender. The Console log appender offers additional configuration options as follows:

| Environment variable   | Accepted values                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `IDENTITY_LOG_PATTERN` | _See the [Log4j2 pattern layout docs](https://logging.apache.org/log4j/2.x/manual/layouts.html#PatternLayout) for possible placeholders._ |

### `Stackdriver`

The Stackdriver log appender produces messages to standard output in a format that is compatible with the GCP cloud platform.

This appender uses the [GCP layout](https://github.com/apache/logging-log4j2/blob/2.x/log4j-layout-template-json/src/main/resources/GcpLayout.json) provided by the [Log4j2](https://logging.apache.org/log4j/2.x/manual/) library.

### `File`

The File log appender produces messages to a rotating log file. The File log appender offers additional configuration options as follows:

| Environment variable              | Accepted values                                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `IDENTITY_LOG_FILE_PATTERN`       | _See the [Log4j2 pattern layout docs](https://logging.apache.org/log4j/2.x/manual/layouts.html#PatternLayout) for possible placeholders._                                |
| `IDENTITY_LOG_FILE_ROTATION_DAYS` | _See the [Log4j2 time-based triggering policy -> interval](https://logging.apache.org/log4j/2.x/manual/appenders.html#timebased-triggering-policy) for possible values._ |
| `IDENTITY_LOG_FILE_ROTATION_SIZE` | _See the [Log4j2 size-bsed triggering policy](https://logging.apache.org/log4j/2.x/manual/appenders.html#sizebased-triggering-policy) for possible values._              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configure-logging
