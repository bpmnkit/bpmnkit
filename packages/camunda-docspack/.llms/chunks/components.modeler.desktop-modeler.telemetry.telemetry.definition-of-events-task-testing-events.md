# Telemetry — Definition of events — Task testing events

Task testing events are sent when using the [task testing](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/task-testing) feature:

- Task execution is started. This event includes `elementType` and `elementTemplate` if applied.
- Task testing deployment. [Deployment event](#deployment-and-start-instance-events) is triggered when the process is deployed during task testing.
- Task execution finished. This event includes `elementType`, `elementTemplate`, `success` boolean value, and `incidentType` if task testing resulted in an [incident](https://docs.camunda.io/docs/next/components/concepts/incidents).

Example task testing finished event:

```json
{
  "elementType": "bpmn:ServiceTask",
  "elementTemplate": "io.camunda.connectors.HttpJson.v2",
  "success": false,
  "incidentType": "JOB_NO_RETRIES"
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
