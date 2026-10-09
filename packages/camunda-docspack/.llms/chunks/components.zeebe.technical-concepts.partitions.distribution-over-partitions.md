# Partitions — Distribution over partitions

When a process instance is created in a partition, its state is stored and managed by the same partition until its execution is terminated. The partition in which it is created is determined by various factors.

- When a client sends a command `CreateProcessInstance` or `CreateProcessInstanceWithResult`, the gateway chooses a partition in a round-robin manner and forwards the requests to that partition. The process instance is created in that partition.
- When a client publishes a message to trigger a **message start event**, the message is forwarded to a partition based on the correlation key of the message. The process instance is created on the same partition where the message is published.
- Process instances created by **timer start events** are always created on partition 1.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions
