# Broker configuration

Let's analyze how to configure the Zeebe Broker

A complete list of broker configuration properties and their defaults is available in the [Zeebe repo](https://github.com/camunda/camunda/blob/main/dist/src/main/config/defaults.yaml).


## Conventions

Take the following conventions into consideration when working with the broker configuration.

### Byte sizes

Buffers and data values referencing sizing must be specified as strings and follow the following format: "10U" where U (unit) must be replaced with KB = Kilobytes, MB = Megabytes or GB = Gigabytes. If unit is omitted then the default unit is simply bytes.

Example:
`sendBufferSize = "16MB"` (creates a buffer of 16 Megabytes)

### Time units

Timeouts, intervals, and the likes, must be specified either in the standard ISO-8601 format used by java.time.Duration, or as strings with the following format: "VU", where:

- V is a numerical value (e.g. 1, 5, 10, etc.)
- U is the unit, one of: ms = Millis, s = Seconds, m = Minutes, or h = Hours

### Paths

Relative paths are resolved relative to the installation directory of the broker.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
