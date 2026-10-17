# Telemetry — Definition of events — Connection event

The `Connection Event` is sent in the following situations:

- Desktop Modeler fails to connect to [a configured Camunda instance](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/connect-to-camunda-8).
- Desktop Modeler connects to a configured Camunda instance.

The `Connection Event` includes the following properties:

- `success`: `true` or `false`
- `targetType`: `SaaS` or `Self-Managed`
- `isLocal`: `true` or `false`
- `reason`: An error reason, or `null`

Example connection event:

```json
{
  "success": true,
  "targetType": "Self-Managed",
  "isLocal": true,
  "reason": null
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
