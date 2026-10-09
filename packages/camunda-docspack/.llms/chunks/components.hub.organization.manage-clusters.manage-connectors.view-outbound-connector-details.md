# Manage your connectors — View outbound connector details

Select an outbound connector to view its details.

The page shows the connector name with badges indicating its direction (**Outbound**), whether it's enabled, and its connectivity status.

The page header shows counts for the selected connector:

| Field        | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| Calls        | The sum of all invocations across runtimes.                    |
| Total time   | The sum of execution time for all invocations across runtimes. |
| Slowest call | The highest execution time recorded across runtimes.           |
| Average time | The total time divided by the number of calls.                 |

The **Configuration** section shows the connector's setup:

| Field           | Description                                                                              |
| --------------- | ---------------------------------------------------------------------------------------- |
| Input variables | The input variables used by the connector.                                               |
| Timeout         | The configured timeout for the connector. If none is set, this shows **Not configured**. |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors
