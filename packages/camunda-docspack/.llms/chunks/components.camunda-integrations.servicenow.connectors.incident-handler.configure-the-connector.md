# ServiceNow Incident Handler — Configure the connector

Select **ServiceNow Incident Handler** from [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) or Desktop Modeler connector templates or download it from the [Camunda Marketplace](https://marketplace.camunda.com/).

### Required fields

| Field          | Description                                                                |
| :------------- | :------------------------------------------------------------------------- |
| Instance name  | Name of your ServiceNow instance (e.g., `your-instance-name`).             |
| Operation      | One of `Create`, `Read`, `Update`, or `Delete`.                            |
| Payload        | JSON data representing incident fields (for Create and Update operations). |
| Sys ID         | Unique identifier for `Read`, `Update`, or `Delete` operations.            |
| Authentication | ServiceNow credentials (username and password).                            |

**Tip**
Store ServiceNow credentials securely as [secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) and reference them in the connector configuration (for example, `{{secrets.snUser}}` and `{{secrets.snPwd}}`).

![ServiceNow Incident Handler example](../img/incident-handler.png)  
_Configuration of the Incident Handler connector in Camunda Hub._

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/incident-handler
