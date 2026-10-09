# Manage your connectors — View inbound connector instance details

Select a row to view additional details and troubleshoot issues.

The page header shows the process name and version and the BPMN element where the connector instance is active, for example **Process2 v1 › Event_0sb4klr**.

The page also shows the following details:

| Field       | Description                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| Instance ID | The ID of the connector instance.                                                                           |
| Connector   | The connector type ID.                                                                                      |
| Webhook URL | For webhook-based inbound connectors, the URL that triggers the connector. Select the copy icon to copy it. |

### Inbound connector runtimes

The page shows each runtime reporting this connector instance on a separate row.

| Field        | Description                                                |
| ------------ | ---------------------------------------------------------- |
| Runtime      | The runtime deployment reporting the connector instance.   |
| Status       | The health of the connector instance on this runtime.      |
| Last updated | When this runtime last reported a status for the instance. |

### Activity log

The activity log shows recent activities recorded for the connector instance. Use these logs to troubleshoot connector issues.

Depending on the connector type, the activity log can include health changes, request details, and runtime events. The activity log redacts sensitive values where needed.

Use the filters to narrow the entries shown and toggle the sort order between latest and oldest first:

| Field       | Description                                                                           |
| ----------- | ------------------------------------------------------------------------------------- |
| Tags        | Filter entries by tag, for example **Health**.                                        |
| Instance    | Filter entries by a specific instance when deduplication groups multiple occurrences. |
| Severity    | Filter entries by severity.                                                           |
| Time window | Filter entries recorded within a specific time range.                                 |

Activity logs are available for active connectors and recent troubleshooting. When a connector is permanently removed, its activity log entries are also removed.

### Process info

For inbound connectors, this section shows detailed information about the BPMN process instance and its associated connector as a JSON object.
Use this information to review process metadata, the connector template, and connector configuration properties.

For example:

```json
[
  {
    "bpmnProcessId": "Process_0wjo4ez",
    "processName": "Order intake",
    "messageName": "order.received",
    "version": 1,
    "processDefinitionKey": 2251799813686169,
    "elementId": "StartEvent_1",
    "elementName": null,
    "elementType": "startEvent",
    "tenantId": "<default>",
    "elementTemplateDetails": {
      "id": "io.camunda.connectors.inbound.KafkaMessageStart.v1",
      "version": "6",
      "icon": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTgnIGhlaWdodD0nMTgnIHZpZXdCb3g9JzAgMCAyNTYgNDE2JyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHByZXNlcnZlQXNwZWN0UmF0aW89J3hNaWRZTWlkJz4KICAgIDxwYXRoIGQ9J00yMDEuODE2IDIzMC4yMTZjLTE2LjE4NiAwLTMwLjY5NyA3LjE3MS00MC42MzQgMTguNDYxbC0yNS40NjMtMTguMDI2YzIuNzAzLTcuNDQyIDQuMjU1LTE1LjQzMyA0LjI1NS0yMy43OTcgMC04LjIxOS0xLjQ5OC0xNi4wNzYtNC4xMTItMjMuNDA4bDI1LjQwNi0xNy44MzVjOS45MzYgMTEuMjMzIDI0LjQwOSAxOC4zNjUgNDAuNTQ4IDE4LjM2NSAyOS44NzUgMCA1NC4xODQtMjQuMzA1IDU0LjE4NC01NC4xODQgMC0yOS44NzktMjQuMzA5LTU0LjE4NC01NC4xODQtNTQuMTg0LTI5Ljg3NSAwLTU0LjE4NCAyNC4zMDUtNTQuMTg0IDU0LjE4NCAwIDUuMzQ4LjgwOCAxMC41MDUgMi4yNTggMTUuMzg5bC0yNS40MjMgMTcuODQ0Yy0xMC42Mi0xMy4xNzUtMjUuOTExLTIyLjM3NC00My4zMzMtMjUuMTgydi0zMC42NGMyNC41NDQtNS4xNTUgNDMuMDM3LTI2Ljk2MiA0My4wMzctNTMuMDE5QzEyNC4xNzEgMjQuMzA1IDk5Ljg2MiAwIDY5Ljk4NyAwIDQwLjExMiAwIDE1LjgwMyAyNC4zMDUgMTUuODAzIDU0LjE4NGMwIDI1LjcwOCAxOC4wMTQgNDcuMjQ2IDQyLjA2NyA1Mi43Njl2MzEuMDM4QzI1LjA0NCAxNDMuNzUzIDAgMTcyLjQwMSAwIDIwNi44NTRjMCAzNC42MjEgMjUuMjkyIDYzLjM3NCA1OC4zNTUgNjguOTR2MzIuNzc0Yy0yNC4yOTkgNS4zNDEtNDIuNTUyIDI3LjAxMS00Mi41NTIgNTIuODk0IDAgMjkuODc5IDI0LjMwOSA1NC4xODQgNTQuMTg0IDU0LjE4NCAyOS44NzUgMCA1NC4xODQtMjQuMzA1IDU0LjE4NC01NC4xODQgMC0yNS44ODMtMTguMjUzLTQ3LjU1My00Mi41NTItNTIuODk0di0zMi43NzVhNjkuOTY1IDY5Ljk2NSAwIDAgMCA0Mi42LTI0Ljc3NmwyNS42MzMgMTguMTQzYy0xLjQyMyA0Ljg0LTIuMjIgOS45NDYtMi4yMiAxNS4yNCAwIDI5Ljg3OSAyNC4zMDkgNTQuMTg0IDU0LjE4NCA1NC4xODQgMjkuODc1IDAgNTQuMTg0LTI0LjMwNSA1NC4xODQtNTQuMTg0IDAtMjkuODc5LTI0LjMwOS01NC4xODQtNTQuMTg0LTU0LjE4NHptMC0xMjYuNjk1YzE0LjQ4NyAwIDI2LjI3IDExLjc4OCAyNi4yNyAyNi4yNzFzLTExLjc4MyAyNi4yNy0yNi4yNyAyNi4yNy0yNi4yNy0xMS43ODctMjYuMjctMjYuMjdjMC0xNC40ODMgMTEuNzgzLTI2LjI3MSAyNi4yNy0yNi4yNzF6bS0xNTguMS00OS4zMzdjMC0xNC40ODMgMTEuNzg0LTI2LjI3IDI2LjI3MS0yNi4yN3MyNi4yNyAxMS43ODcgMjYuMjcgMjYuMjdjMCAxNC40ODMtMTEuNzgzIDI2LjI3LTI2LjI3IDI2LjI3cy0yNi4yNzEtMTEuNzg3LTI2LjI3MS0yNi4yN3ptNTIuNTQxIDMwNy4yNzhjMCAxNC40ODMtMTEuNzgzIDI2LjI3LTI2LjI3IDI2LjI3cy0yNi4yNzEtMTEuNzg3LTI2LjI3MS0yNi4yN2MwLTE0LjQ4MyAxMS43ODQtMjYuMjcgMjYuMjcxLTI2LjI3czI2LjI3IDExLjc4NyAyNi4yNyAyNi4yN3ptLTI2LjI3Mi0xMTcuOTdjLTIwLjIwNSAwLTM2LjY0Mi0xNi40MzQtMzYuNjQyLTM2LjYzOCAwLTIwLjIwNSAxNi40MzctMzYuNjQyIDM2LjY0Mi0zNi42NDIgMjAuMjA0IDAgMzYuNjQxIDE2LjQzNyAzNi42NDEgMzYuNjQyIDAgMjAuMjA0LTE2LjQzNyAzNi42MzgtMzYuNjQxIDM2LjYzOHptMTMxLjgzMSA2Ny4xNzljLTE0LjQ4NyAwLTI2LjI3LTExLjc4OC0yNi4yNy0yNi4yNzFzMTEuNzgzLTI2LjI3IDI2LjI3LTI2LjI3IDI2LjI3IDExLjc4NyAyNi4yNyAyNi4yN2MwIDE0LjQ4My0xMS43ODMgMjYuMjcxLTI2LjI3IDI2LjI3MXonCiAgICAgICAgICBzdHlsZT0nZmlsbDojMjMxZjIwJy8+Cjw"
    },
    "properties": {
      "deduplicationMode": "AUTO",
      "deduplicationModeManualFlag": "false",
      "schemaStrategy.type": "noSchema",
      "topic.topicName": "rereer",
      "consumeUnmatchedEvents": "true",
      "inbound.type": "io.camunda:connector-kafka-inbound:1",
      "authenticationType": "credentials",
      "correlationRequired": "notRequired",
      "topic.bootstrapServers": "eererreer",
      "autoOffsetReset": "latest"
    }
  }
]
```

**Note**
If you are using deduplication, each connector occurrence in the BPMN diagram is shown in the array.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-connectors
