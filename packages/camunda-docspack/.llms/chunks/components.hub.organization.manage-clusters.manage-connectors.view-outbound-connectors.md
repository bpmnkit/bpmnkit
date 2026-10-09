# Manage your connectors — View outbound connectors

The **Outbound connectors** tab shows each active outbound connector type on a separate row.

The page header shows counts across all outbound connector invocations:

| Field               | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| Connector types     | The number of distinct outbound connector types available.             |
| Invocations (total) | The total number of invocations recorded since the last runtime start. |
| Max execution time  | The longest execution time recorded across all invocations.            |
| Failure rate        | The percentage of invocations that failed.                             |

Use the search box, status filter, and **With invocations** checkbox to narrow the list of outbound connectors. Each connector type shows aggregated counts:

| Field       | Description                                                                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name        | The name and type ID of the outbound connector. Select it to view its details.                                                                               |
| Invocations | The total number of invocations recorded for this connector.                                                                                                 |
| Max time    | The longest execution time recorded for this connector.                                                                                                      |
| Failed      | The number of failed invocations recorded for this connector.                                                                                                |
| Status      | The connectivity status of the connector, for example **All connected**. See [connectivity states](#outbound-connector-runtimes) for what each status means. |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors
