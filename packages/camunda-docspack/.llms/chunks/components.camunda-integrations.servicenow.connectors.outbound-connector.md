# ServiceNow outbound connector

Perform CRUD operations on any ServiceNow table directly from Camunda processes using the ServiceNow outbound connector.

Use the ServiceNow outbound connector to perform CRUD operations on any ServiceNow table directly from Camunda processes.

This connector interacts with ServiceNow tables via REST APIs, enabling powerful integrations without custom scripts.


## Supported operations

| Operation | Description                                                                  | Example use case                                                 |
| :-------- | :--------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| Create    | Insert a new record into a ServiceNow table.                                 | Create a new incident or service request from a Camunda process. |
| Read      | Retrieve records from a ServiceNow table using query parameters or `sys_id`. | Look up user details or check incident status.                   |
| Update    | Modify fields of an existing record identified by `sys_id`.                  | Update ticket status or assignment group.                        |
| Delete    | Remove a record from a table by `sys_id`.                                    | Delete temporary or test records after processing.               |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/connectors/outbound-connector
