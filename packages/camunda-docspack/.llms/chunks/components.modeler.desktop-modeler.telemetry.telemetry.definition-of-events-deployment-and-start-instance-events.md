# Telemetry — Definition of events — Deployment and start instance events

The `Deployment Event` is sent in the following situations:

- User deploys a BPMN or DMN diagram to Camunda 7 or Camunda 8
- User deploys a Form to Camunda 7

The `Deployment Event` and `Start Instance` have the following properties:

- `diagramType`: BPMN, DMN, or Form
- Engine profile:
  - `executionPlatform`: &lt;target platform\>
  - `executionPlatformVersion`: &lt;target platform version\>

In the event of an unsuccessful deployment, an `error` property will be present in the payload containing an error code.

If provided, as is the case when deploying to a Zeebe-based platform, the payload also includes the target type of the deployment:

```json
"targetType": "[camundaCloud or selfHosted]"
```

If the target engine profile is set in the diagram, the payload will also contain it.

```json
 "executionPlatform": "<target platform>"
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
