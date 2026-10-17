# Glossary — I

### Inbound connector

Inbound [Connectors](#connector) in Camunda 8 enable workflows to receive data or messages from external systems or services, making it possible to integrate workflows into a wider business process or system architecture.

Inbound connectors include three subtypes: [webhooks](#webhook-connector), [subscriptions](#subscription-inbound-connector), and polling.

Unlike [outbound connectors](#outbound-connector), inbound connectors are **stateful**. The Java code of the inbound connector has a lifecycle suitable for long-running operations, such as listening for messages on a queue or waiting for a webhook to be called.
Each element referencing an inbound connector will lead to the creation of one inbound connector instance. A process definition with one webhook start event and two additional webhooks as intermediate catch events would therefore lead to the creation of three inbound connector instances.

### Incident

An incident represents an error condition which prevents [Zeebe](#zeebe) from advancing an executing [process instance](#process-instance). Zeebe will create an incident if there was an uncaught exception thrown in your code and the number of retries of the given step is exceeded.

- [Incident](https://docs.camunda.io/docs/next/components/concepts/incidents)

### Ingress

An Ingress is a Kubernetes object that manages external access to the services within a Kubernetes cluster. An **Ingress controller** is required to route traffic to your services according to the rules defined on the Ingress.

- [Ingress setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
