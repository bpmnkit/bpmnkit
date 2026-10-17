# SAP eventing with SAP Advanced Event Mesh (AEM)

React to CloudEvents between Camunda and SAP Advanced Event Mesh (AEM) in a BPMN process.

Receive [CloudEvents](https://cloudevents.io/) from SAP Advanced Event Mesh (AEM) and send CloudEvents to AEM.


## About SAP eventing

SAP eventing uses three connectors that enable bidirectional communication between Camunda and AEM.

<!-- add links of Element Template from marketplace! -->

| Connector                                                                                                                                  | Description                                                                                                                                                                                                                               |
| :----------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [SAP Eventing Outbound Connector](https://marketplace.camunda.com/en-US/apps/632606/sap-eventing-outbound-connector)                       | Sends CloudEvents from Camunda to an AEM topic or queue endpoint.                                                                                                                                                                         |
| [SAP Eventing Message Start Event Connector](https://marketplace.camunda.com/en-US/apps/632607/sap-eventing-message-start-event-connector) | Translates an incoming CloudEvent from AEM into a [BPMN Message Start Event](https://docs.camunda.io/docs/next/components/modeler/bpmn/message-events/message-events#message-start-events) to trigger a new process instance.                                           |
| [SAP Eventing Intermediate Event Connector](https://marketplace.camunda.com/en-US/apps/632751/sap-eventing-intermediate-event-connector)   | Translates an incoming CloudEvent from AEM into a [BPMN Intermediate Catch Event](https://docs.camunda.io/docs/next/components/modeler/bpmn/message-events/message-events#intermediate-message-catch-events) to allow an active process to continue based on the event. |

The integration uses **HTTP** as the transport protocol:

- Incoming connectors act as webhooks, receiving CloudEvent payloads and delivering them into process instances.
- The outbound connector sends `HTTP POST` requests to an AEM [topic](https://docs.solace.com/Messaging/Guaranteed-Msg/Topic-Endpoints.htm) or [queue](https://docs.solace.com/Messaging/Guaranteed-Msg/Queues.htm) endpoint.

**Info**
SAP Advanced Event Mesh uses [Solace Event Broker](https://solace.com/products/event-broker/) as its core event broker.  
The terms **AEM** and **Solace Event Broker** can be used interchangeably when referring to eventing functionality.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/eventing
