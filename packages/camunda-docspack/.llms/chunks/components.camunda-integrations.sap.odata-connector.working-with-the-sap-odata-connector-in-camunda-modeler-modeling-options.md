# SAP OData connector — Working with the SAP OData connector in Camunda Modeler — Modeling options

To use the **SAP OData connector** in your process, either change the type of existing task by clicking on it and selecting the **Change element** menu icon, or create a new connector task by using the **Append connector** context menu. Follow our [guide to using connectors](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index) to learn more.

**Note**
The configuration options will dynamically change with the selected HTTP method and the OData protocol version. For example, a `payload` field is only displayed when the HTTP method is something other than "GET".

![SAP OData connector element template](./img/sap-odata-connector-template.png)

Specifying the `BTP destination name` allows you to reuse existing Destinations from the subaccount or instance level. Authentication and authorizations are maintained at this level, which is why it's not necessary to maintain credentials for the connector.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/odata-connector
