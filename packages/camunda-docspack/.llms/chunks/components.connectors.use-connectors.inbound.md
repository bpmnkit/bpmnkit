# Use an inbound connector

Learn how to use inbound connectors

[Inbound connectors](https://docs.camunda.io/docs/next/components/connectors/connector-types#inbound-connectors) enable workflows to receive data or messages from external systems or services.  
Review our [list of existing inbound connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) for more information.


## Creating the connector event

Inbound connectors are modeled as **catch events** in [BPMN](https://docs.camunda.io/docs/next/components/modeler/bpmn/bpmn). Connectors can be modeled as:

- **Start events** – Start a new process instance.
- **Message start events** – Start a new process instance with a `messageId` to prevent duplicate process instance creation.
- **Intermediate catch events** – Receive messages in an already running process instance.
- **Boundary events** – Receive messages in an already running process instance, attached to a task.
- **Boundary events** – Receive messages in an already running process instance, attached to a task.
- **Receive tasks** - Receive messages in an already running process instance.

**Info**
If **idempotency** is a concern for the process creation and reprocessing of messages should never lead to a duplicate process instance creation, use the **message start event** element for an inbound connector as it relies on publishing a message.

Unlike plain **start event** elements, **message start events** support the **message ID expression** property that allows you to derive a unique value from the connector output. This value is used by Zeebe to [guarantee uniqueness](https://docs.camunda.io/docs/next/components/concepts/messages#message-uniqueness) in case other messages are published using the same **Message ID**.

When you **deploy** such a BPMN diagram with an inbound connector, the connector becomes ready to receive incoming requests. The outcome depends on the connector type:

- **Webhook connectors** become available via the **webhook endpoint**.
- **Subscription connectors** start listening to the **message queue**.
- **Polling connectors** start polling the **external system**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/inbound
