# Inbound connector deduplication

Learn how inbound connector deduplication works in Camunda.

Inbound

In the simplest case, each inbound connector element in a BPMN diagram corresponds to a unique endpoint, event consumer, or a polling task.
However, the connector runtime can combine multiple compatible inbound connector elements.
The runtime can do this automatically, or you can request it.

This page explains the concept of deduplication in the connector runtime.


## Purpose of deduplication

Consider the following BPMN diagram:

![Connector deduplication use-case example](../img/deduplication-example.png)

In this diagram, two connector events are listening to the same message queue that can contain messages of two types: `PAYMENT_COMPLETED` and `PAYMENT_CANCELLED`.
When the process execution arrives at the event gateway, the type of the message determines which path the process will take.
If each connector event listened to the message queue using a separate subscription, this might lead to race conditions if the message is received by a different consumer (for example, the `PAYMENT_COMPLETED` event being consumed by the consumer that expects `PAYMENT_CANCELLED`).
Eventually, this might lead to message loss or delayed processing, while also increasing the load on the message broker as the message is returned to the queue.

To avoid this, both events can be assigned to the same subscription by assigning the same deduplication ID to both events. Then, all messages will be consumed by the same subscription, and the connector runtime will evaluate the activation condition of each event to determine which one should be triggered.

**Note**
When using this pattern, ensure each event’s activation condition is mutually exclusive, so only one event is triggered per message.
Attempting to trigger multiple events for the same message will result in an error.

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication
