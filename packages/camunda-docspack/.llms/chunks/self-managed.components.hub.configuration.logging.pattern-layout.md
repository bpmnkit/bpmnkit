# Logging — Pattern layout

The default layout displays **time only**, thread name, MDC context, log level, logger name, and message.

#### Example pattern

```perl
%d{HH:mm:ss.SSS} [%t] %notEmpty{[%X] }%-5level %logger{36} - %msg%n
```

| Feature             | Pattern                            |
| ------------------- | ---------------------------------- |
| Timestamp           | Time only                          |
| Logger name         | Package initials + full class name |
| Newline after level | No                                 |
| Tab before logger   | No                                 |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging
