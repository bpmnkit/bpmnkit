# ServiceNow Incident Handler — Example configurations

### Create a new incident

| Field         | Example value                                                        |
| :------------ | :------------------------------------------------------------------- |
| Instance name | `your-instance-name`                                                 |
| Operation     | `Create`                                                             |
| Payload       | `{"short_description": "Create ServiceNow Incident (from Camunda)"}` |
| Username      | `{{secrets.snUser}}`                                                 |
| Password      | `{{secrets.snPwd}}`                                                  |

### Update an existing incident's priority

| Field         | Example value        |
| :------------ | :------------------- |
| Instance name | `your-instance-name` |
| Operation     | `Update`             |
| Sys ID        | `{{incidentSysId}}`  |
| Payload       | `{"priority": "2"}`  |
| Username      | `{{secrets.snUser}}` |
| Password      | `{{secrets.snPwd}}`  |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/incident-handler
