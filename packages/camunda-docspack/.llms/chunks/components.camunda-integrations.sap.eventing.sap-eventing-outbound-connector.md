# SAP eventing with SAP Advanced Event Mesh (AEM) — SAP Eventing Outbound Connector

The **SAP Eventing Outbound Connector** allows you to send CloudEvents to AEM using its REST messaging capability. It publishes the event using an `HTTP POST` request.

![SAP eventing outbound connector configuration](./img/eventing-outbound-connector.png)

### Endpoint

The **Endpoint** field specifies the URL of your AEM event broker.

You can find this URL in AEM’s web interface:

> **Cluster Manager → Your Cluster → (Service Details) → Connect → Connect with Java → Solace REST Messaging API**

The **FQDN** (fully qualified domain name) is shown on the right-hand side.

![FQDN of the AEM REST messaging API](./img/eventing-aem-rest-fqdn.png)

### Topic / queue

Specify the target **topic** or **queue** path where the CloudEvent will be published.  
Do not begin the path with `/`. The connector includes a validation check to prevent this.

### Authorization

Supported authorization methods:

- `None`
- `API Key`
- `Basic`
- `OAuth 2.0`
- `Bearer Token`

### CloudEvent

CloudEvent metadata (e.g., `ce-id`, `ce-subject`) is automatically handled by the AEM broker, including the required `Solace-User-Property-` prefix.  
Configure only the standard CloudEvent attributes in the connector.

The CloudEvent data is serialized into a **JSON body**, and both metadata and data fields support [FEEL expressions](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) for dynamic values.

![Eventing Outbound CloudEvent](./img/eventing-outbound-cloudevent.png)

### Other configuration options

All remaining options are identical to those of the [REST Connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest), including:

- [Connection timeout](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#network-communication-timeouts)
- [Output mapping](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#output-mapping)

These settings control network behavior and define how response data is mapped to process variables.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/eventing
