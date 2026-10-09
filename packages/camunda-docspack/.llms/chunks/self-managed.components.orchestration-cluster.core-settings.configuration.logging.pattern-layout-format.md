# Logging — Pattern layout/format

- Default layout shows **time only**, thread name, MDC context, log level, logger name, and message.

**Example pattern:**

```perl
%d{HH:mm:ss.SSS} [%t] %notEmpty{[%X] }%-5level %logger{36} - %msg%n
```

| Feature             | Old pattern         | New pattern                        |
| ------------------- | ------------------- | ---------------------------------- |
| Timestamp           | Full date and time  | Time only                          |
| Logger name         | Up to 36 characters | Package initials + full class name |
| Newline after level | Yes                 | No                                 |
| Tab before logger   | Yes                 | No                                 |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging
