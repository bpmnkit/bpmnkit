# Gateway configuration — Configuration — zeebe.gateway.threads

To handle many concurrent incoming requests, the user can do two things: scale the deployed gateways (if the standalone mode is in use), or increase the used resources and threads.

The Zeebe Gateway uses one thread by default, but this should be set to a higher number if the gateway doesn’t exhaust its available resources and doesn’t keep up with the load. The corresponding environment variables look like this: `ZEEBE_GATEWAY_THREADS_MANAGEMENTTHREADS`.
During benchmarking and when increasing the thread count, it may also make sense to increase the given resources, which are quite small in the Helm chart.

With the Helm charts, the gateway is embedded in the Orchestration Cluster nodes, so the number of gateways follows `orchestration.clusterSize`. Running more than one node enables quick failover: if one node dies, the remaining nodes can handle the traffic.

A separate thread pool is used to run the gRPC business logic. The thread pool is elastic (meaning it will start/stop threads dynamically), but will always keep a minimum number of threads, and only start up to a maximum number of threads. By default, this range is from one thread per core, up to two threads per core.

To explore how the gateway behaves, or what it does, metrics can be consumed. By default, the gateway exports Prometheus metrics, which can be scrapped under `:9600/actuator/prometheus`.

| Field             | Description                                                                                                                                                                                           | Example value |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| managementThreads | Sets the number of threads the gateway will use to communicate with the broker cluster. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_THREADS_MANAGEMENTTHREADS`. | 1             |
| grpcMinThreads    | Sets the minimum number of threads in the gRPC thread pool. Only accepts static values; defaults to the number of cores available.                                                                    | 8             |
| grpcMaxThreads    | Sets the maximum number of threads in the gRPC thread pool. Only accepts static values; defaults to twice the number of cores available.                                                              | 16            |

#### YAML snippet

```yaml
threads:
  managementThreads: 1
  grpcMinThreads: 8
  grpcMaxThreads: 16
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
