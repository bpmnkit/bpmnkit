# Connector runtime performance — Measure outbound connector performance

The performance of a connector runtime is typically evaluated by two metrics:

- Jobs processed per second (throughput)
- Average processing time per activated job

The connector runtime exposes various metrics via `/actuator/prometheus`, including:

```
camunda_client_worker_job_total
camunda_connector_outbound_execution_time_seconds
executor_seconds_count{name="camundaClientExecutor"}
executor_seconds_max{name="camundaClientExecutor"}
```

Use Prometheus to scrape the metrics and visualize them. While no official Grafana dashboard is provided for connectors,
you can use the [connectors community Grafana dashboard](https://github.com/camunda-community-hub/connectors-grafana-dashboard) as a starting point.


## Identify the bottleneck

To better understand what adjustments you need, verify where the bottleneck is:

- Is your third-party system limiting throughput?
- Is CPU or memory saturated?
- Is the connector runtime operating in streaming or polling mode?

### Job streaming

**Note**
Starting with connector runtime version 8.9.0+, job streaming is enabled by default.

If your runtime operates in polling mode, you may observe the following side effects:

- The runtime does not pick up new jobs immediately and instead waits until the previous batch of jobs is fully processed, even though there are available threads.
- Job distribution is uneven between multiple replicas of the connector runtime, causing some replicas to be idle while others are overloaded.

To mitigate these issues, you can enable job streaming by setting the following property in your connector runtime configuration:

```
camunda.client.worker.defaults.stream-enabled=true
```

We recommend enabling job streaming unless you have specific reasons to use polling mode.  
To learn more, see [Job streaming in the gateway](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/job-streaming).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/performance
