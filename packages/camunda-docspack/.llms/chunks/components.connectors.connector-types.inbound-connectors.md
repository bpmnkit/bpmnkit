# Connector types — Inbound connectors

Inbound connectors enable workflows to receive data or messages from external systems or services, making it possible to integrate workflows into a wider business process or system architecture.
Inbound connectors can be used to create a new process instance, or to send a message to a running process instance.

The Java code of the inbound connector has a lifecycle suitable for long-running operations, such as listening for messages on a queue or waiting for a webhook to be called.
The connector code is **activated** as soon as the connector Runtime detects an element in a process definition that references an inbound connector. It gets `deactivated` in case of an updated or deleted process definition.

Inbound connector instances are linked to process definitions and not to specific process instances. If a process definition contains an element referencing an inbound connector, the connector code will be first executed when the process definition is deployed and the deployment has been detected by the connector Runtime.
The connector object created during deployment will be kept active as long as the process is deployed, and it is reused to serve all instances of the process.
When the process definition is deleted or replaced with a newer version, the connector object will be removed or updated as well.

**Note**
The connector Runtime currently fetches only the **latest version** of each process definition.

Deploying a new process definition version deactivates inbound connectors from older versions. [Migrate older versions](https://docs.camunda.io/docs/next/components/concepts/process-instance-migration) if the new inbound connector configuration won't correlate messages for existing instances.

![Inbound connectors](img/inbound-connectors.png)

Use inbound connectors if something needs to happen within the workflow engine because of an external event in the third-party system. For example, because a Slack message was published, or a REST endpoint is called.

There are three types of inbound connectors:

1. **Webhook connector**: An inbound connector which creates a webhook for a Camunda workflow.
2. **Subscription connector**: An inbound connector that subscribes to a message queue.
3. **Polling connector**: An inbound connector that periodically polls an external system or service for new data using HTTP polling.

---
Source: https://docs.camunda.io/docs/next/components/connectors/connector-types
