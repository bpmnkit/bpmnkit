# Deployment configuration — Consequences of increasing maxMessageSize

Raising `maxMessageSize` can have the following consequences, especially with large, frequent payloads:

- **Broker memory**: In-flight log entries consume broker memory, so larger entries increase memory usage.
- **Raft timeouts**: An entry too large to replicate in time can trigger unexpected leader changes or broken replication.
- **Latency**: Large entries can slow down overall processing.
- **Network limits**: Load balancers, ingresses, and firewalls often cap request and response sizes lower than Zeebe does, and may reject larger messages.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/orchestration-cluster-api-rest-deployment-configuration
