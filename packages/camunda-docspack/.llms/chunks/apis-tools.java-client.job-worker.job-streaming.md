# Job worker — Job streaming

Job workers are designed to regularly poll and activate jobs. It's also possible to use them in a streaming fashion, such that jobs are automatically activated and pushed downstream to workers without requiring an extra round of polling. This greatly cuts down on overall activation latency by completely removing the poll request.

### Usage

Enabling job streaming consists of toggling a single flag in the job worker builder:

```java
public JobWorkerBuilderStep3 enableStreaming(final JobWorkerBuilderStep3 builder) {
  return builder.streamEnabled(true);
}
```

This configures the job worker to open a long-living stream between itself and a gateway, through which activated jobs will be pushed. **If the stream is closed for any reason - e.g. the gateway crashed, there is a temporary network issue, etc. - it is automatically recreated.**

**Note**
It's also possible to set an overall timeout - so called `streamTimeout` - which ensures the underlying long-living stream is refreshed once the timeout is reached. This is useful to trigger load balancing of your workers overtime, instead of having workers pinned to the same gateway.

#### Backfilling

Even with streaming enabled, job workers still occasionally poll the cluster for jobs. Due to implementation constraints, when a job is made activate-able, it is pushed out only if there exists a stream for it; if not, it remains untouched. However, if a stream exists, then streaming is always prioritized over polling.

This ensures polling will not activate any new jobs, and the worker will back off and poll less often as long as it receives empty responses overtime.

#### Backpressure

To avoid your workers being overloaded with too many jobs, e.g. running out of memory, the Java job worker relies on the [built-in gRPC flow control mechanism](https://grpc.io/docs/guides/flow-control/). If streaming is enabled, this means the worker will never work on more jobs than the configured `maxJobsActive` parameter. For example, if `maxJobsActive = 32`, then your worker will only work on at most 32 jobs concurrently. If this is already the case, and a 33rd job comes in, the gRPC thread will block, thus signaling the gateway to stop sending more jobs.

**If streaming is enabled, back pressure applies to both pushing and polling**. You can then use `maxJobsActive` as a way to soft-bound the memory usage of your worker. For example, if your max message size is 4MB, and `maxJobsActive = 32`, then a single worker could use up to 128MB of memory in the worst case.

**Note**
If the worker blocks longer than the job's deadline, the job will **not** be passed to the worker, but will be dropped. As it will time out on the broker side, it will be pushed again.

#### Proxying

If you're using a reverse proxy or a load balancer between your worker and your gateway, you may need to configure additional parameters to ensure the job stream is not closed unexpectedly with an error. If you observe regular 504 timeouts, read our guide on [job streaming](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/job-streaming).

By default, the Java job workers have a stream timeout of one hour. You can overwrite this by calling the `streamTimeout` of the job worker builder:

```java
final JobWorkerBuilderStep3 builder = ...;
builder.streamTimeout(Duration.ofMinutes(30));
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
