# SAP eventing with SAP Advanced Event Mesh (AEM) — SAP Eventing Message Start Event Connector

Inbound CloudEvents → BPMN message.

Applying the **SAP Eventing Message Start Event Connector** generates a unique **webhook URL** that starts a new BPMN process instance when invoked.

![Webhook URL](./img/eventing-webhook.png)

**Info**
The webhook URL is generated **only after the initial deployment** of the process.

This URL must be registered as a target in **SAP Advanced Event Mesh (AEM)**.  
The host portion of the URL (`https://<region>.connectors.camunda.io`) is used when configuring the **REST consumer** in AEM.

![AEM REST consumer](./img/eventing-aem-rest-consumer.png)

### Authentication

In the REST consumer configuration, set up authentication from AEM to the Camunda webhook endpoint.  
The credentials configured in the **Authorization** section of the built-in connector must match the **authentication scheme** used in AEM.

![Camunda and AEM credentials](./img/eventing-authorization.png)

### Queue binding

The path component of the Camunda webhook URL must be used as the **POST request target** in the **Queue Binding** of the REST consumer.

![AEM Queue Binding](./img/eventing-aem-queue-binding.png)

### Other configuration options

The remaining configuration options are identical to those of the [HTTP Webhook Connector](https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook), except for one key difference:

> The default webhook response explicitly returns a `200` status code and an `"OK"` message body, confirming that the CloudEvent was successfully received and acknowledged by Camunda.

![Remaining Incoming Webhook config](./img/eventing-incoming-other-config.png)

### Event flow

When a CloudEvent is received from AEM, all **header properties** and the **body payload** are relayed to the target process instance, either:

- At process creation (Message Start Event), or
- During event correlation (Intermediate Event).

This ensures that message attributes and payload data from AEM are preserved end-to-end within the Camunda process.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/eventing
