# Job worker — Metrics — Workarounds for additional metrics

The decision to track a small set of metrics directly in the client is a conscious one. The idea is we should only be tracking what is not possible for users to track themselves. If you believe a specific metric should be tracked by us, do open a feature request for it. In the meantime, here is a list of workarounds to help you track additional job worker-related metrics that you can already use:

#### Job polling count

You can use a gRPC [ClientInterceptor](https://grpc.github.io/grpc-java/javadoc/io/grpc/ClientInterceptor.html) or an Apache HttpClient [AsyncExecChainHandler](https://hc.apache.org/httpcomponents-client-5.3.x/current/httpclient5/apidocs/org/apache/hc/client5/http/async/AsyncExecChainHandler.html) to track any client calls, including the `ActivateJobsCommand` call that is sent every time a worker polls for more jobs.

Here's an example using Micrometer APIs that integrate a gRPC [ClientInterceptor](https://javadoc.io/doc/io.micrometer/micrometer-core/1.7.2/io/micrometer/core/instrument/binder/grpc/MetricCollectingServerInterceptor.html) and Apache HttpClient [AsyncExecChainHandler](https://javadoc.io/doc/io.micrometer/micrometer-core/1.12.0/io/micrometer/core/instrument/binder/httpcomponents/hc5/ObservationExecChainHandler.html):

```java
import java.nio.channels.AsynchronousCloseException;

public CamundaClientBuilder configureClientMetrics(final CamundaClientBuilder builder, final MeterRegistry meterRegistry, final ObservationRegistry observationRegistry) {
    final ClientInterceptor monitoringInterceptor = new MetricCollectingClientInterceptor(meterRegistry);
    final AsyncExecChainHandler monitoringHandler = new ObservationExecChainHandler(observationRegistry);
    return builder.withInterceptors(monitoringInterceptor).withChainHandlers(monitoringHandler);
}
```

#### Executor metrics

If you wish to tune your job worker executor, you can pass a custom, instrumented executor to the client builder. For example, if we use Micrometer:

```java
public CamundaClientBuilder configureClientMetrics(
    final CamundaClientBuilder builder,
    final ScheduledExecutorService executor,
    final MeterRegistry meterRegistry) {
  final ScheduledExecutorService instrumentedExecutor = ExecutorServiceMetrics.monitor(meterRegistry, executor, "job-worker-executor");
  return builder.jobWorkerExecutor(instrumentedExecutor);
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
