# Telemetry — Definition of events — Overlay opened event

The `Overlay Opened Event` is sent when an overlay is opened via user interaction. Currently, this event is sent in the following circumstances:

- Version Info overlay is opened
- Deployment overlay is opened
- Start instance overlay is opened
- Deployment overlay is closed
- Start Instance overlay is closed

For the **Version Info** overlay, the event also sends `source` of the click (`"menu"` or `"statusBar"`).

For the **Deployment** and **Start Instance** overlays, the event also send the `diagramType` (BPMN, DMN or Form).

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
