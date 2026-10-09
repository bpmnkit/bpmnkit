# Manage your connectors — View inbound connectors

The **Inbound connectors** tab shows each active inbound connector type on a separate row.

The page header shows counts across all inbound connector instances:

| Field               | Description                                                                           |
| ------------------- | ------------------------------------------------------------------------------------- |
| Unhealthy instances | The total number of unhealthy inbound connector instances across all connector types. |
| Unknown instances   | The total number of inbound connector instances with an unknown status.               |
| Total instances     | The total number of inbound connector instances running.                              |
| Connector types     | The number of distinct inbound connector types with active instances.                 |

Use the search box and status filter to narrow the list of active inbound connectors. Each connector type shows aggregated counts for its instances:

| Field              | Description                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| Name               | The name and type ID of the inbound connector. Select the connector name to view its running instances. |
| Unhealthy          | The number of instances currently unhealthy.                                                            |
| Unknown            | The number of instances with an unknown status.                                                         |
| Healthy            | The number of instances currently healthy.                                                              |
| Triggers           | The total number of triggers recorded for this connector type.                                          |
| Correlation failed | The total number of correlation failures recorded for this connector type.                              |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors
