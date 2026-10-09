# SAP RFC connector — Overview

For a standard overview of the steps involved in the SAP RFC connector, see the following diagram:

![RFC overview](./img/rfc-connector-ops.png)


## Prerequisites

- **Camunda API Client**
  - [Create an API client](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients) for your Camunda SaaS cluster with the full scope: `Zeebe,Tasklist,Operate,Optimize,Secrets`
- **To run the SAP RFC connector**, the following SAP infrastructure setup is required:
  - [Cloud Foundry CLI](https://github.com/cloudfoundry/cli) with the [multiapps plugin](https://github.com/cloudfoundry/multiapps-cli-plugin) installed on the machine executing the deployment.
  - SAP BTP subaccount with a [Cloud Foundry environment](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime?region=all) enabled and a [created space](https://help.sap.com/docs/btp/sap-business-technology-platform/create-spaces).
  - A minimum of [1 GB storage quota and 2 GB runtime memory](https://help.sap.com/docs/btp/sap-business-technology-platform/managing-space-quota-plans).
- **[Entitlements](https://help.sap.com/docs/btp/sap-business-technology-platform/managing-entitlements-and-quotas-using-cockpit) for**:
  - [Connectivity Service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all), `lite` plan (to connect to the SAP is on-premises).
  - [Destination Service](https://discovery-center.cloud.sap/serviceCatalog/destination?service_plan=lite&region=all&commercialModel=btpea), `lite` plan.
  - [Authorization and Trust Management Service](https://discovery-center.cloud.sap/serviceCatalog/authorization-and-trust-management-service?region=all), `application` plan.
- **One or more instance- or subaccount-level Destinations**, pointing to the SAP systems to communicate with.
  ![btp-destination-rfc](./img/btp-destination-rfc.png)
- **Ensure `Additional Properties` is set** on the Destination are aligned with those of your connector or remote SAP system.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/rfc-connector
