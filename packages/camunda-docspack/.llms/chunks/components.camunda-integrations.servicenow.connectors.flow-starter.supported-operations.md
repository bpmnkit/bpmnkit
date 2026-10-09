# ServiceNow Flow Starter — Supported operations

| Operation    | Description                                                          | Example use case                                                        |
| :----------- | :------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| Trigger Flow | Start a ServiceNow Flow Designer flow via its REST trigger endpoint. | Initiate catalog requests or approval workflows from Camunda processes. |


## Configure the connector

In Camunda Hub or Desktop Modeler, select **ServiceNow Flow Starter** from the connector templates or download it from the [Camunda Marketplace](https://marketplace.camunda.com/).

### Required fields

| Field                 | Description                                                                                                                          |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| Instance name         | Name of your ServiceNow instance (e.g., `your-instance-name`).                                                                       |
| REST API trigger path | REST API endpoint for the ServiceNow flow (e.g., `/api/camun/my_flow_name`).                                                         |
| Method                | HTTP method for the request (`POST`, `GET`, `PUT`, `PATCH`, `DELETE`).                                                               |
| Headers               | Optional HTTP headers to include in the request (e.g., `{"hello":"header"}`).                                                        |
| Query parameters      | Optional URL query parameters (e.g., `{"hello":"query"}`).                                                                           |
| Request body          | Payload sent to the ServiceNow flow, typically containing input variables or correlation data (e.g., `{"correlationValue": camId}`). |
| Authentication        | ServiceNow credentials (username and password).                                                                                      |

**Tip**
Store ServiceNow credentials securely as [secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) and reference them in the connector configuration (for example, `{{secrets.snUser}}`).

![Configuration of the Flow Starter connector in Camunda Hub.](../img/flow-starter.png)
_Configuration of the Flow Starter connector in Camunda Hub._

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/flow-starter
