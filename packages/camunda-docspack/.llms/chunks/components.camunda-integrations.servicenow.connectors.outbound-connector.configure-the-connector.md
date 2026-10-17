# ServiceNow outbound connector — Configure the connector

In Camunda Hub or Desktop Modeler, select **ServiceNow Outbound Connector** from the connector templates or download it from the [Camunda Marketplace](https://marketplace.camunda.com/).

### Required fields

| Field            | Description                                                                                             |
| :--------------- | :------------------------------------------------------------------------------------------------------ |
| Instance name    | Name of your ServiceNow instance (e.g., `your-instance-name`).                                          |
| Operation        | One of `Create`, `Read`, `Update`, or `Delete`.                                                         |
| Target table     | The target ServiceNow table (e.g., `incident`, `sc_task`, `sc_req_item`).                               |
| Payload          | JSON data sent to ServiceNow for `Create` and `Update` operations.                                      |
| Query parameters | For `Read` operations. Use `^` to separate multiple filter conditions (e.g., `active=true^priority=1`). |
| Sys ID           | Required for `Update` and `Delete` operations to identify the target record.                            |
| Authentication   | ServiceNow credentials (username and password).                                                         |

**Tip**
Store ServiceNow credentials securely as [secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) and reference them in the connector configuration (for example, `{{secrets.snUser}}` and `{{secrets.snPwd}}`).

![ServiceNow Outbound Connector example](../img/outbound-connector.png)  
_Example configuration of the Create operation in Camunda Hub._

> When using `Read`, `Update`, or `Delete`, the `sys_id` field becomes available in the connector properties to specify the target record.

![Sys ID field example](../img/outbound-sys-id.png)

<!-- _Example showing the `sys_id` field for Update operation._ -->

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/outbound-connector
