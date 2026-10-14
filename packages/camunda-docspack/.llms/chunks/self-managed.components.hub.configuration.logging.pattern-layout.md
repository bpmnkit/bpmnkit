# Logging — Pattern layout

The default layout displays the full date and time, thread name, MDC context, log level, logger name, and message. A newline and a tab separate the log level from the logger name.

#### Default pattern

```perl
[%d{yyyy-MM-dd HH:mm:ss.SSS}] [%t] %notEmpty{[%X] }%-5level%n\t%logger{36} - %msg%n
```

| Feature             | Pattern                     |
| ------------------- | --------------------------- |
| Timestamp           | Full date and time          |
| Logger name         | Fully qualified logger name |
| Newline after level | Yes                         |
| Tab before logger   | Yes                         |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging
