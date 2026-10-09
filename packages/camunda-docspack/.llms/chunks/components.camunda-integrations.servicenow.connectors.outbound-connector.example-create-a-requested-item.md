# ServiceNow outbound connector — Example: Create a requested item

| Field         | Example value                                                                                                          |
| :------------ | :--------------------------------------------------------------------------------------------------------------------- |
| Instance name | `your-instance-name`                                                                                                   |
| Operation     | `Create`                                                                                                               |
| Target table  | Requested item [sc_req_item]                                                                                           |
| Payload       | `{"short_description": "Database maintenance scheduled via Camunda process", "category": "Hardware", "priority": "2"}` |
| Username      | `{{secrets.snUser}}`                                                                                                   |
| Password      | `{{secrets.snPwd}}`                                                                                                    |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/outbound-connector
