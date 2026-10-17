# SAP RFC connector

The SAP RFC connector is a Java Spring Boot application that runs on SAP BTP.

The [SAP RFC](https://docs.camunda.io/docs/next/reference/glossary#rfc) [Connector](https://docs.camunda.io/docs/next/components/connectors/introduction) is a [protocol and outbound connector](https://docs.camunda.io/docs/next/components/connectors/connector-types).
This connector is a Java Spring Boot application that runs as a `.war` on the SAP Business Technology Platform (BTP).

It connects to Camunda 8 SaaS, and utilizes SAP BTP's [Destination](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/destination-service) and [Connectivity](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/what-is-sap-btp-connectivity) concepts to query a SAP system via the RFC protocol to interact with remote-enabled Function Modules and BAPIs.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/rfc-connector
