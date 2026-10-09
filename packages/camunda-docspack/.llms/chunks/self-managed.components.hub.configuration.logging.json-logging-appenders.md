# Logging — JSON logging appenders

| Appender           | Description                                          | Enable / Variable                                                                 |
| ------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| Console            | Standard text output.                                | `CAMUNDA_HUB_LOG_APPENDER=Console`                                                |
| Stackdriver (JSON) | JSON output for Google Cloud / Stackdriver.          | `CAMUNDA_HUB_LOG_APPENDER=Stackdriver`                                            |
| RollingFile        | Writes logs to a rotating file, disabled by default. | `CAMUNDA_LOG_FILE_APPENDER_ENABLED=true` + `CAMUNDA_HUB_LOG_APPENDER=RollingFile` |

#### JSON structure

When using the `Stackdriver` appender, this is the structure of the entries :

| Field                                   | Type              | Description                                                                        |
| --------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `timestamp`                             | string (ISO-8601) | Log event timestamp in UTC using pattern `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'`.           |
| `severity`                              | string            | Normalized log severity mapped from Log4j level (e.g., TRACE→DEBUG, WARN→WARNING). |
| `message`                               | string            | The log message, stringified by the message resolver.                              |
| `logging.googleapis.com/sourceLocation` | object            | Metadata describing the location in source code where the log originated.          |
| ├─ `file`                               | string            | File name where the logging call occurred.                                         |
| ├─ `line`                               | number            | Line number in the source file.                                                    |
| └─ `function`                           | string            | Fully qualified class and method name (via `%C.%M`).                               |
| `logging.googleapis.com/labels`         | object (MDC)      | Key/value pairs from the Mapped Diagnostic Context.                                |
| `threadContext`                         | object            | Information about the thread producing the log event.                              |
| ├─ `id`                                 | number            | Thread ID.                                                                         |
| ├─ `name`                               | string            | Thread name.                                                                       |
| └─ `priority`                           | number            | Thread priority.                                                                   |
| `loggerName`                            | string            | The logger’s name (typically the class name).                                      |
| `exception`                             | string (optional) | Stringified stack trace of any thrown exception.                                   |
| `correlationId`                         | string (optional) | Value of the MDC entry `correlationId`, if present.                                |

See the following example:

```json
{
  "timestamp": "2025-11-20T10:55:57.885Z",
  "severity": "INFO",
  "message": "Example log message",
  "logging.googleapis.com/sourceLocation": {
    "file": "RequestLoggingFilter.java",
    "line": 91,
    "function": "io.camunda.modeler.util.logging.RequestLoggingFilter.customAfterRequest"
  },
  "logging.googleapis.com/labels": {
    "correlationId": "04284456-b95b-4121-a54b-6c48be6d3afd"
  },
  "threadContext": {
    "id": 55,
    "name": "http-nio-8081-exec-1",
    "priority": 5
  },
  "loggerName": "io.camunda.modeler.util.logging.RequestLoggingFilter",
  "correlationId": "04284456-b95b-4121-a54b-6c48be6d3afd"
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging
