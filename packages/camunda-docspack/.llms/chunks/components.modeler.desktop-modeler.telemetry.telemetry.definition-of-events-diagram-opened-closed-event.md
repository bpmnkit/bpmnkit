# Telemetry — Definition of events — Diagram opened/closed event

The `Diagram Opened Event` is sent in the following situations:

- User created a new BPMN diagram
- User created a new DMN diagram
- User created a new Form
- User opened an existing BPMN diagram
- User opened an existing DMN diagram
- User opened an existing Form

The `Diagram Closed Event` is sent in the following situations:

- User closed a BPMN diagram
- User closed a DMN diagram
- User closed a Form

These events include the following properties:

- `diagramType`: BPMN, DMN, or Form
- Engine profile:
  - `executionPlatform`: &lt;target platform\>
  - `executionPlatformVersion`: &lt;target platform version\>

In the case of a form, the payload also includes the `formFieldTypes`:

```json
"formFieldTypes": {
  "textfield": 6,
  "group": 2,
  "image": 4
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
