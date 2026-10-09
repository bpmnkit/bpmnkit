# Interceptors

**Danger**

Interceptors are only applied to the gRPC API of the gateway, and do not affect any REST calls.

For REST-related middleware, read the [gateway filters documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/filters).

All communication from a client to a broker must first pass through a gateway.
There they can be intercepted before being dispatched. Zeebe provides a way to
load arbitrary interceptors into the gateway. Some typical examples of what you
can accomplish with this include:

- Enforcing custom authorization rules on incoming calls
- Monitoring and logging of incoming calls (e.g.
  https://github.com/grpc-ecosystem/java-grpc-prometheus)
- Distributed tracing (e.g.
  https://github.com/open-telemetry/opentelemetry-java-instrumentation)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/interceptors
