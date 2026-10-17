# Telemetry — Definition of events — Form editor events

The `Form editor events` are sent on different interactions with the form builder:

- User opened or collapsed a panel in the form editor. The event includes the current open state for each form preview panel and the interaction that triggered the change.

```json
{
  "layout": {
    "form-input": {
      "open": true
    },
    "form-output": {
      "open": true
    },
    "form-preview": {
      "open": true
    }
  },
  "triggeredBy": "keyboardShortcut|previewPanel|statusBar|windowMenu"
}
```

- User interacted with the form input data panel.
- User interacted with the form preview panel.

In all events [the execution platform and version](#diagram-openedclosed-event) are sent as well.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
