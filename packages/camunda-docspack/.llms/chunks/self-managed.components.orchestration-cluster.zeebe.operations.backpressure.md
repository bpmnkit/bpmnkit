# Backpressure

This document outlines an overview of backpressure and its accompanying assets.

When a broker receives a client request, it is written to the **event stream** first (see section [internal processing](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing) for details), and processed later by the stream processor.

If the processing is slow or if there are many client requests in the stream, it might take too long for the processor to start processing the command.
If the broker keeps accepting new requests from the client, the backlog increases and the processing latency can grow beyond an acceptable time.

To avoid such problems, Zeebe employs a backpressure mechanism. When the
broker receives more requests than it can process with an acceptable
latency, it rejects some requests (see [technical error handling](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/technical-error-handling)).

Alternatively, [flow control write rate limits](https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control) can also be used with static write rate limits or throttling. This prevents the
partition from building an excessive backlog of records not exported.

### Terminology

- **RTT** - Round-Trip Time, known as the time between when the request is accepted by the broker and when the response to the request is sent back to the gateway.
- **Inflight count** - The number of requests accepted by the broker but the response is not yet sent.
- **Limit** - Maximum number of flight requests. When the inflight count is above the limit, any new incoming request is rejected.

**Note**
The limit and inflight count are calculated per partition.

### Backpressure algorithms

Zeebe uses adaptive algorithms from [concurrency-limits](https://github.com/Netflix/concurrency-limits) to dynamically calculate the limit.
Configure Zeebe with one of the backpressure algorithms in the following sections.

The default values can be found in the [Zeebe repo](https://github.com/camunda/camunda/blob/main/dist/src/main/config/defaults.yaml) in the `# backpressure` section.

#### Fixed limit

With **fixed limit**, one can configure a fixed value of the limit.
Zeebe operators are recommended to evaluate the latencies observed with different values for limit.
Note that with different cluster configurations, you may have to choose different limit values.

#### AIMD

**Additive increase/multiplicative decrease (AIMD)** calculates the limit based on the configured _requestTimeout_.
When the RTT for a request is shorter than _requestTimeout_, the limit is increased by 1.
When the RTT is longer than _requestTimeout_,
the limit will be reduced according to the configured _backoffRatio_.

#### Vegas

Vegas is an adaptive limit algorithm based on TCP Vegas congestion control algorithm.
Vegas estimates a base latency as the minimum observed latency.
This base RTT is the expected latency when there is no load.
Whenever the RTT deviates from the base RTT, a new limit is calculated based on the Vegas algorithm.
Vegas allows you to configure two parameters - _alpha_ and _beta_.
The values correspond to a queue size estimated by the Vegas algorithm based on the observed RTT, base RTT, and current limit.
When the queue size is below _alpha_, the limit is increased.
When the queue size is above _beta_, the limit is decreased.

#### Gradient

Gradient is an adaptive limit algorithm that dynamically calculates the limit based on observed RTT.
In the gradient algorithm, the limit is adjusted based on the gradient of observed RTT and an observed minimum RTT.
If gradient is less than 1, the limit is decreased. Otherwise, the limit is increased.

#### Gradient2

Gradient2 is similar to Gradient, but instead of using observed minimum RTT as the base, it uses an exponentially smoothed average RTT.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backpressure
