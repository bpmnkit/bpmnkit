# Backpressure — Backpressure tuning

The goal of backpressure is to keep the processing latency low.
The processing latency is calculated as the time between the command is written to the event stream until it is processed.
To see how backpressure behaves, run a benchmark on your cluster and observe the following metrics:

- `zeebe_stream_processor_latency_bucket`
- `zeebe_dropped_request_count_total`
- `zeebe_received_request_count_total`
- `zeebe_backpressure_requests_limit`

You may want to run the benchmark with different loads:

1. With low load - Where the number of requests sent per second is low.
2. With high load - Where the number of requests sent per second is above what Zeebe can process within a reasonable latency.

If the value of the limit is small, the processing latency will be small, but the number of rejected requests may be high.
If the value of the limit is large, fewer requests may be rejected (depending on the request rate),
but the processing latency may increase.

When using **fixed limit**, you can run the benchmark with different values for the limit.
You can then determine a suitable value for a limit for which the processing latency (`zeebe_stream_processor_latency_bucket`) is within the desired latency.

When using **AIMD**, you can configure a `requestTimeout` which corresponds to a desired latency.
Note that during high load, AIMD can lead to a processing latency two times more than the configured `requestTimeout`.
It is also recommended to configure a `minLimit` to prevent the limit from aggressively dropping during constant high load.

When using **Vegas**, you cannot configure the backpressure to a desired latency.
Instead, Vegas tries to keep the RTT as low as possible based on the observed minimum RTT.

Similar to Vegas, you cannot configure the desired latency in Gradient and Gradient2.
They calculated the limit based on the gradient of observed RTT from the expected RTT.
The higher the value of _rttTolerance_, the higher deviations are tolerated that results in higher values for limit.

If a lot of requests are rejected due to backpressure, it might indicate that the processing capacity of the cluster is not enough to handle the expected throughput.
If this is the expected workload, you might consider a different configuration for the cluster, such as provisioning more resources and increasing the number of nodes and partitions.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backpressure
