# SAP OData connector

The SAP OData connector is a protocol and outbound connector that runs as a Docker image on the SAP Business Technology Platform (BTP).

The SAP OData connector is a protocol and outbound [connector](https://docs.camunda.io/docs/next/components/connectors/introduction) that runs as a Docker image on the SAP Business Technology Platform (BTP).

This connector is designed to run in [hybrid mode](https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode), hosted in the customer's SAP BTP sub-account in the [Cloud Foundry environment](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime?region=all).

This connector works with Camunda 8 SaaS, and utilizes SAP BTP's [Destination](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/destination-service) and [Connectivity](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/what-is-sap-btp-connectivity) concepts to query a SAP system via both OData v2 and v4.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/odata-connector
