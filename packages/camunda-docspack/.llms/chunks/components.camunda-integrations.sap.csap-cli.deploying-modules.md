# CSAP c8ctl plugin — Deploying modules

After each Camunda SAP integration module is set up with `c8ctl csap-setup`, it is ready for deployment. The plugin prints `in directory <path>` after every successful run. Use this path for the deployment.

For the OData and RFC connectors, run `cf deploy <directory-printed-by-csap-setup>`.

Deploying the module to BTP and integrating it into the application lifecycle management of your organization is the responsibility of your SAP practice. To learn more, see the deployment sections of the [OData connector](https://docs.camunda.io/docs/next/components/camunda-integrations/sap/odata-connector) and [RFC connector](https://docs.camunda.io/docs/next/components/camunda-integrations/sap/rfc-connector) pages.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/csap-cli
