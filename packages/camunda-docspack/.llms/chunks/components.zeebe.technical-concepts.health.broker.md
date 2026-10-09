# Health — Broker

The health of a broker is computed from the health of its component tree. While there are many components in the broker, it's sufficient to understand that a broker is considered:

- **Healthy** if and only if all components in the tree are healthy.
- **Unhealthy** if at least one component is unhealthy.
- **Dead** if at least one component is dead.

There are many components in a broker, but most importantly, each partition in a broker is a separate, independent component. As such, you can roughly define the health of a broker as the sum of the health of its partitions.

The health of a broker is reported via its [status health check](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/health#broker).

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/health
