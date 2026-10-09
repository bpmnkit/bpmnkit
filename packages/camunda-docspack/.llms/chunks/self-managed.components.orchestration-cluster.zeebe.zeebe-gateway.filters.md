# Filters

All communication from a client to a broker must first pass through a gateway. There, it can be filtered before being dispatched.

**Danger**

Filters are only applied to the Orchestration Cluster REST API of the gateway, and do not affect any gRPC calls.

For gRPC-related middleware, review the [gateway interceptors documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/interceptors).

All communication from a client to a broker must first pass through a gateway.
There, it can be filtered before being dispatched.

Zeebe provides a way to load arbitrary REST API filters into the gateway. Some typical examples of what you can accomplish with this include:

- Enforcing custom authorization rules on incoming calls
- Monitoring and logging incoming calls

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/filters
