# SAP OData connector — Overview

For a standard overview of the steps involved in the SAP OData connector, see the following diagram:

![OData steps](./img/odata-connector-ops.png)


## Prerequisites

[Create an API client](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients) for your Camunda SaaS cluster with the full scope: `Zeebe,Tasklist,Operate,Optimize,Secrets`

To run the SAP OData connector Docker image, the following SAP infrastructure setup is required:

- [Cloud Foundry CLI](https://github.com/cloudfoundry/cli) with [multiapps plugin](https://github.com/cloudfoundry/multiapps-cli-plugin) installed on the machine executing the deployment.
- SAP BTP subaccount with a [Cloud Foundry environment](https://discovery-center.cloud.sap/serviceCatalog/cloud-foundry-runtime?region=all) enabled and a [created space](https://help.sap.com/docs/btp/sap-business-technology-platform/create-spaces).
- Minimum of [1 GB storage quota and 2 GB runtime memory](https://help.sap.com/docs/btp/sap-business-technology-platform/managing-space-quota-plans).
- [Entitlements](https://help.sap.com/docs/btp/sap-business-technology-platform/managing-entitlements-and-quotas-using-cockpit) for:
  - [Connectivity Service](https://discovery-center.cloud.sap/serviceCatalog/connectivity-service?region=all), `lite` plan (to connect to the SAP on-premises).
  - [Destination Service](https://discovery-center.cloud.sap/serviceCatalog/destination?service_plan=lite&region=all&commercialModel=btpea), `lite` plan.
- One or more instance- or subaccount-level destinations, pointing to the SAP systems to communicate with.
  ![sample BTP destination configuration](./img/btp-destination.png)
- Ensure `Additional Properties` are correctly set on the Destination.
  For example:

```json
HTML5.DynamicDestination: true
sap-client: <client/"Mandant" to work with on the SAP system>
WebIDEEnabled: true
WebIDESystem: <SAP system ID>
WebIDEUsage: odata_gen
```

**Info**
The SAP OData connector currently supports only destination authentication types suitable for straight-through (machine-to-machine) processing: scenarios without user tasks in the execution path.

Use `BasicAuthentication` or any `OAuth2`-based mechanism.

`PrincipalPropagation` is not supported because it requires a user-bound security context. Camunda user tasks do not expose a JWT (for example, as a transient variable) that the connector can forward at runtime.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/odata-connector
