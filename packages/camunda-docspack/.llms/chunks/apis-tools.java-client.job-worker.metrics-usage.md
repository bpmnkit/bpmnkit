# Job worker — Metrics — Usage

To use job worker metrics, create a new instance of a `JobWorkerMetrics` implementation, and pass it along to the builder:

```java
public final JobWorker openWorker(final CamundaClient client, final JobHandler handler) {
  final JobWorkerMetrics metrics = new MyCustomJobWorkerMetrics();
  return client.newJobWorker()
    .jobType("foo")
    .handler(handler)
    .metrics(metrics)
    .open();
}
```

#### Micrometer implementation

The Java client comes with an optional, built-in [Micrometer](https://micrometer.io/) implementation of `JobWorkerMetrics`.

**Note**
[Micrometer](https://micrometer.io/) is a popular metrics facade in the Java ecosystem - what SLF4J is to logging. It can be configured to export metrics to many other systems, such as OpenTelemetry, Prometheus, StatsD, Datadog, etc.

If your project does not yet use Micrometer, you need to add it to your dependencies, and wire it up to your metrics backend, [as described in the Micrometer docs](https://micrometer.io/docs).

Once Micrometer is set up in your project, you can start using the implementation. For example:

```java
public final JobWorker openWorker(final CamundaClient client, final JobHandler handler) {
  final MeterRegistry meterRegistry = new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
  final JobWorkerMetrics metrics = JobWorkerMetrics
    .micrometer()
    .withMeterRegistry(meterRegistry)
    .withTags(Tags.of("zeebe.client.worker.jobType", "foo", "zeebe.client.worker.name", "bee"))
    .build();
  return client.newJobWorker()
    .jobType("foo")
    .handler(handler)
    .metrics(metrics)
    .name("bee")
    .open();
}
```

**Note**
There are currently no built-in tags, primarily because these are likely to be high cardinality, which can become an issue with some metric registries. If you want per-worker tags, create a different `JobWorkerMetrics` instance per worker.

This implementation creates four metrics:

| Metric name                         | Description                           | Notes                                                                     |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| camunda.client.worker.job.activated | Counts the number of jobs activated   | New                                                                       |
| camunda.client.worker.job.handled   | Counts the number of jobs handled     | New                                                                       |
| zeebe.client.worker.job.activated   | Deprecated counter for jobs activated | Will be removed at 8.10. Use camunda.client.worker.job.activated instead. |
| zeebe.client.worker.job.handled     | Deprecated counter for jobs handled   | Will be removed at 8.10. Use camunda.client.worker.job.handled instead.   |

**Warning: Deprecated metrics**
The following metrics are deprecated and will be removed in version 8.10:

- `zeebe.client.worker.job.activated`, replace with `camunda.client.worker.job.activated`
- `zeebe.client.worker.job.handled`, replace with `camunda.client.worker.job.handled`

Please update your monitoring integrations to use the new metrics before upgrading to version 8.10.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
