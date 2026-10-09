# Logging — Environment variables

| Purpose             | Variable            | Component(s)        | Example / Notes               |
| ------------------- | ------------------- | ------------------- | ----------------------------- |
| Global log level    | `CAMUNDA_LOG_LEVEL` | All                 | `DEBUG`, `INFO`, `WARN`, etc. |
| Zeebe package level | `ZEEBE_LOG_LEVEL`   | Zeebe               | Overrides global level        |
| Atomix / clustering | `ATOMIX_LOG_LEVEL`  | Atomix / Raft       | Default WARN if unset         |
| Elasticsearch logs  | `ES_LOG_LEVEL`      | `org.elasticsearch` |                               |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging
