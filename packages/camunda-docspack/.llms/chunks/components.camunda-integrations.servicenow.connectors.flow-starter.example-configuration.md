# ServiceNow Flow Starter — Example configuration

| Field                 | Example value                 |
| :-------------------- | :---------------------------- |
| Instance name         | `your-instance-name`          |
| REST API trigger path | `/api/camun/your_flow_name`   |
| Method                | `POST`                        |
| Headers               | `{"hello": "header"}`         |
| Query parameters      | `{"hello": "query"}`          |
| Request body          | `{"correlationValue": camId}` |
| Username              | `{{secrets.snUser}}`          |
| Password              | `{{secrets.snPwd}}`           |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/flow-starter
