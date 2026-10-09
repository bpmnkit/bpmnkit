# SAP eventing with SAP Advanced Event Mesh (AEM) — Prerequisites

Because **HTTP** is used as the transport protocol, AEM must be configured to use [REST messaging](https://docs.solace.com/API/REST/REST-get-start.htm). This enables publishers and subscribers to communicate over HTTP.

The configuration examples below build on the Solace tutorial [Publish/Subscribe REST Messaging](https://tutorials.solace.dev/rest-messaging/publish-subscribe/), which provides detailed steps for setting up REST-based publish/subscribe messaging.


## Installation

Install the SAP Eventing connectors directly from the [Camunda Marketplace](https://marketplace.camunda.com/).


## Configuration overview

- [SAP Eventing Message Start Event Connector](#sap-eventing-message-start-event-connector)
- [SAP Eventing Intermediate Event Connector](#sap-eventing-intermediate-event-connector)
- [SAP Eventing Outbound Connector](#sap-eventing-outbound-connector)

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/eventing
