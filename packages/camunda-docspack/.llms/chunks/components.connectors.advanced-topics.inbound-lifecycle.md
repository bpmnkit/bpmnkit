# Inbound connector lifecycle

Learn how the inbound connector lifecycle affects your processes.

Inbound

Inbound connectors in Camunda have a lifecycle that depends on process definition deployments.
It is important to understand this lifecycle to work with inbound connectors effectively.

This page explains when inbound connectors are activated and deactivated, what can affect their execution, and how to monitor their status.


## Inbound connector executables

An executable is an instance of an inbound connector that is managed by the connector runtime.

An executable is mapped to one or more process definitions deployed to the engine.
In the simplest case, deploying a new process definition will create a new executable in the connector runtime.
However, in general, one executable can be reused for multiple inbound connector elements in the diagram. To learn how the runtime reuses executables across connectors, see [Inbound connector deduplication](https://docs.camunda.io/docs/next/components/connectors/advanced-topics/deduplication).

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/inbound-lifecycle
