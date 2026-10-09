# Manage your connectors — View inbound connector instances

Select an inbound connector to view its running instances.

The page header shows counts for the selected connector:

| Field                        | Description                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Active inbound executables   | The number of active instances for this connector.                              |
| Triggers (total)             | The total number of triggers recorded since the last runtime start.             |
| Correlation failures (total) | The total number of correlation failures recorded since the last runtime start. |

By default, the page shows each inbound connector instance on a separate row below the header counts.

| Field     | Description                                                                                                                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Process   | The process ID and version associated with the connector instance. Select it to open the process in Operate.                                                                                                                                       |
| Elements  | The BPMN element where the connector is active. Use this to locate the connector in your diagram.                                                                                                                                                  |
| Activated | When the connector instance was activated.                                                                                                                                                                                                         |
| Status    | The current health of the connector instance. **Healthy** means the connector is running without issues. **Unhealthy** means the connector requires attention. Open the instance details to review health details and recent activity log entries. |
| Restart   | If a connector instance fails to activate or is stuck in an unhealthy state, select **Restart** after you resolve the underlying issue to retry activation.                                                                                        |

Select **Show runtime breakdown** to view the header counts by runtime. The breakdown shows each runtime in its own column alongside a total:

| Field   | Description                                                                                                                         |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Event   | The type of event recorded, for example **Triggered**, **Correlated**, **Correlation failed**, or **Activation condition not met**. |
| Runtime | The count of this event recorded by a specific runtime deployment, identified by its deployment ID.                                 |
| Total   | The sum of this event's count across all runtimes.                                                                                  |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors
