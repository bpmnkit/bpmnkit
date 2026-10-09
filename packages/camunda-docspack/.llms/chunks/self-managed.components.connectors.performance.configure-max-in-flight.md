# Connector runtime performance — Configure `max-in-flight`

The maximum concurrency (`max-in-flight`) defines how many jobs the connector runtime can work on in parallel.
The right configuration for `max-in-flight` depends on the executor type used by the connector runtime.

### Virtual threads executor (default)

Starting with connector runtime version 8.9.0+, the connector runtime uses virtual threads by default.

Virtual threads are lightweight threads that allow high concurrency with low resource consumption.
They are optimized for I/O-bound workloads such as connectors.

This feature builds on Project Loom, which is part of the standard Java Development Kit (JDK) starting with JDK 19. The current long-term support (LTS) release is JDK 21.

When you use virtual threads, the `max-in-flight` configuration defines the maximum number of virtual threads that can process jobs in parallel. The connector runtime can efficiently handle a large number of virtual threads, so you can often set a high `max-in-flight` value (for example, 500) without running into resource constraints.

To configure the `max-in-flight` for a connector runtime using virtual threads, set the following property:

```
camunda.client.worker.defaults.max-jobs-active=500
```

There is no practical upper limit for `max in-flight` when using virtual threads, but usually, the
performance bottleneck will be due to objective CPU limitations or external system rate limits.

We recommend gradually increasing the `max-in-flight` value while monitoring the performance and resource usage of your connector runtime until you reach an optimal configuration.

### Platform threads executor

You can disable virtual threads and use platform threads instead by setting the following property:

```
camunda.connector.virtual-threads.enabled=false
```

Connector runtime versions before 8.9.0 use platform threads by default.

When using platform threads, use the configuration options provided by the [Camunda Spring Boot Starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration):

```
camunda.client.worker.defaults.max-jobs-active=20
camunda.client.execution-threads=20
```

The `max-jobs-active` property defines the maximum number of jobs that are activated in parallel.
The `execution-threads` property defines the size of the thread pool used to process jobs.
If you set `max-jobs-active` higher than `execution-threads`, the connector runtime queues jobs until a thread becomes available for processing.
If you set `execution-threads` higher than `max-jobs-active`, some threads remain idle while waiting for jobs to be activated.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/performance
