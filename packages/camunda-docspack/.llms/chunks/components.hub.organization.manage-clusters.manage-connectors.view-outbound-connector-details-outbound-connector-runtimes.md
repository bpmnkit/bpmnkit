# Manage your connectors — View outbound connector details — Outbound connector runtimes

The **Connector runtimes** section shows each runtime deployment reporting the connector, with its connectivity details and invocation metrics.

| Field             | Description                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Connector runtime | The runtime deployment reporting the connector and its overall connectivity status, for example **All connected**.              |
| Connectivity type | The connectivity reported for this runtime, for example **Broker** or **Gateway**, along with its status and number of streams. |
| Stream IDs        | The stream IDs registered for this connectivity type. Select the copy icon to copy an ID.                                       |

Each broker or gateway connectivity type reports one of the following connectivity states:

| State               | Description                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All connected       | All client streams for this job type are registered as consumers on all broker remote streams.                                                                                                                                                                                                                                                        |
| Partially connected | Client streams exist on the gateway, but not all of them appear as consumers on every broker's remote stream. This can indicate a transient issue; if it persists, restart the gateway.                                                                                                                                                               |
| None                | Brokers were queried, but no client stream appears as a consumer on any broker's remote stream. This indicates a genuine connectivity problem.                                                                                                                                                                                                        |
| Unknown             | The broker state can't be determined. This can happen when broker monitoring isn't configured; broker monitoring is configured but the query failed and the gateway's remote streams are also empty; or the gateway is a standalone deployment with no embedded broker. Enable and configure broker monitoring to get an accurate connectivity state. |

Each runtime also shows its own invocation metrics:

| Field           | Description                                          |
| --------------- | ---------------------------------------------------- |
| Completed       | The number of invocations completed on this runtime. |
| Cumulative time | The total execution time recorded on this runtime.   |
| Slowest         | The highest execution time recorded on this runtime. |
| Mean time       | The average execution time recorded on this runtime. |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors
