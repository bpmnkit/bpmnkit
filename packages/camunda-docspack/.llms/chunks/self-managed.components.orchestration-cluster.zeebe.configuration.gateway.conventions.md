# Gateway configuration — Conventions

Take the following conventions into consideration when working with the gateway configuration.

### Byte sizes

Buffers and data values referencing sizing must be specified as strings and follow the following format: "10U" where U (unit) must be replaced with KB = Kilobytes, MB = Megabytes or GB = Gigabytes. If unit is omitted then the default unit is simply bytes.

For example, `sendBufferSize = "16MB"` creates a buffer of 16 Megabytes.

### Time units

Timeouts and intervals must be specified either in the standard ISO-8601 format used by `java.time.Duration`, or as strings with the following format: "VU", where:

- V is a numerical value (e.g. 1, 5, 10, etc.)
- U is the unit, one of: ms = Milliseconds, s = Seconds, m = Minutes, or h = Hours

### Paths

Relative paths are resolved relative to the installation directory of the broker.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
