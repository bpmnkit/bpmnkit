# Glossary — B

### Backpressure

Backpressure is a protection mechanism that prevents [Zeebe brokers](#zeebe-broker) from being overloaded when they receive more [client](#zeebe-client) requests than they can process with acceptable latency. Zeebe brokers determine backpressure by using dynamic backpressure algorithms or - if enabled - flow control limits, which measure the rate of records written by the [exporter](#zeebe-exporter). When backpressure is activated, client requests are rejected to maintain system stability.

- [Backpressure](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backpressure)
- [Flow control](https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control)

### Broker

See [Zeebe Broker](#zeebe-broker).

### BPMN model

See [Process](#process).

### BTP

BTP stands for [SAP](#sap) Business Technology Platform, which is a cloud-based platform that provides tools and services for data management, analytics, application development, and integration within the SAP ecosystem.

Camunda can integrate with SAP BTP to orchestrate business processes across SAP and non-SAP systems. By doing so, it enables automation and visibility of workflows that span multiple services and applications hosted on BTP, enhancing agility and process control in enterprise environments.

- [SAP integration](https://docs.camunda.io/docs/next/components/camunda-integrations/sap/camunda-sap-integration)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
