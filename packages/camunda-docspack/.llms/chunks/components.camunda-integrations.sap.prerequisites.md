# Prerequisites

Review the required Camunda components, SAP services, authentication setup, and connectivity before deploying the SAP integration modules.

Before setting up the SAP integration, ensure the following requirements are met.


## Camunda setup

- **OData and RFC connectors:** 8.7+
- **Advanced Event Mesh integration:** 8.7+

Compatible with both **SaaS** and **Self-Managed** deployments:

- **SaaS:** Use [hybrid connectors](https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode) to securely connect to SAP systems.
- **Self-Managed:** Ensure outbound network connectivity from your environment to SAP BTP.


## SAP setup

You need an **SAP BTP subaccount** with these services enabled:

- [**Cloud Foundry Runtime**](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime?region=all)
- [**Destination Service (Free)**](https://discovery-center.cloud.sap/serviceCatalog/destination?region=all&service_plan=lite&commercialModel=btpea) – for system and service connectivity
- [**Connectivity Service (Free)**](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all) – required for on-premises SAP S/4HANA or ECC
- [**SAP Cloud Connector**](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/cloud-connector) – bridges on-premises systems with BTP

Additional services may be required depending on your use case:

- [**SAP Advanced Event Mesh (AEM)**](https://discovery-center.cloud.sap/serviceCatalog/advanced-event-mesh?region=all) – enables event-driven integration between Camunda and SAP.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/prerequisites
