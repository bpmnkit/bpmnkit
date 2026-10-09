# Internal processing — Handling backpressure

When a broker receives a client request, it is written to the **event stream** first, and processed later by the stream processor. If the processing is slow or if there are many client requests in the stream, it might take too long for the processor to start processing the command. If the broker keeps accepting new requests from the client, the backlog increases and the processing latency can grow beyond an acceptable time.

To avoid such problems, Zeebe employs [flow control](https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control) strategies that apply write rate limits and [backpressure](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backpressure) to user requests.

In the case of backpressure when the broker receives more requests than it can process with an acceptable latency, it rejects some requests. For flow control, it can be used with static write rate limits or throttling which prevents the
partition from building an excessive backlog of records not exported.

Backpressure is indicated to the client by throwing a **resource exhausted** exception. If a client sees this exception, it can retry the requests with an appropriate retry strategy. If the rejection rate is high, it indicates the broker is constantly under high load and you need to reduce the rate of requests. Alternatively, you can also increase broker resources to adjust to your needs. In high-load scenarios, it is recommended to [benchmark](https://camunda.com/blog/2022/05/how-to-benchmark-your-camunda-platform-8-cluster/) your Zeebe Broker up front to size it correctly.

The maximum rate of requests that can be processed by a broker depends on the processing capacity of the machine, the network latency, current load of the system, etc. There is no fixed limit configured in Zeebe for the maximum rate of requests it accepts. Instead, Zeebe uses an adaptive algorithm to dynamically determine the limit of the number of in-flight requests (the requests that are accepted by the broker, but not yet processed).

The in-flight request count is incremented when a request is accepted, and decremented when a response is sent back to the client. The broker rejects requests when the in-flight request count reaches the limit.

This is not a single static threshold for the whole broker. Zeebe calculates the in-flight count and the limit per partition, and the current limit changes over time based on the configured backpressure algorithm. To observe the current limit, monitor the `zeebe_backpressure_requests_limit` metric. For more details, see [backpressure](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backpressure) and [metrics](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics#performance-metrics).

---
---

**Note**
We recommend reducing the rate of requests. When backpressure is active, the broker may reject any request except _CompleteJob_ RPC and _FailJob_ RPC. These requests are allowed during backpressure and are always accepted by the broker even if it is receiving requests above its limits.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing
