# Zeebe Gateway — Embedded versus standalone

The Zeebe Gateway can be run in two different ways: embedded and standalone.

### embedded

Running the gateway in embedded mode means it will run as part of the Zeebe Broker. The broker will accept gRPC client messages via the embedded gateway and distribute the translated requests inside the cluster. This means the request accepted by the embedded gateway does not necessarily go to the same broker, where the embedded gateway is running.

The embedded gateway is the default since Camunda 8.8, where the Orchestration Cluster components are bundled into a single application. `zeebe.broker.gateway.enable` defaults to `true`. Every Orchestration Cluster node then accepts client traffic on port `26500` for gRPC and port `8080` for REST, and you distribute that traffic across the nodes with a load balancer. Both the [Kubernetes reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes) and the [manual reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/manual) run in this mode.

The embedded gateway also reduces the burden of deploying and running multiple applications in development and testing. For example, in [zeebe-process-test](https://github.com/camunda/zeebe-process-test) an embedded gateway is used to accept the client commands and write directly to the engine.

**Note: Be aware**
If the gateway is running in the embedded mode, it will consume resources from the broker, which might impact the performance of the system.

### standalone

Running the gateway in standalone mode means the gateway will be executed as its own application, started with the `gateway` entry point of the distribution instead of `camunda`. This separates concerns and lets you scale the gateway independently of the brokers, based on the current workload.

Since Camunda 8.8, standalone mode is not part of a Camunda reference architecture:

- The Helm charts no longer deploy a gateway workload. They deploy a single Orchestration Cluster StatefulSet with the embedded gateway, sized with `orchestration.clusterSize`.
- The [manual reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/manual) runs the same single application on every node.

Use the embedded gateway unless you have a specific reason to run a standalone gateway.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/zeebe-gateway-overview
