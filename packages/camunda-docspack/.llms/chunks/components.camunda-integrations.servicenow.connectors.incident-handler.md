# ServiceNow Incident Handler

Create, update, or manage incidents in ServiceNow directly from Camunda processes using the incident handler connector.

Use the ServiceNow Incident Handler connector to create, read, update, or delete incidents in ServiceNow directly from Camunda processes.

This connector works with the ServiceNow `incident` table, enabling automated IT service management and process-driven incident handling.


## Supported operations

| Operation | Description                                                  | Example use case                                            |
| :-------- | :----------------------------------------------------------- | :---------------------------------------------------------- |
| Create    | Create a new incident in ServiceNow.                         | Automatically log an incident when a process task fails.    |
| Read      | Retrieve details of an existing incident using its `sys_id`. | Check the current status of an incident.                    |
| Update    | Modify fields on an existing incident.                       | Change incident priority or assignment group mid-process.   |
| Delete    | Remove an incident by its `sys_id`.                          | Clean up test or temporary incidents after automation runs. |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/incident-handler
