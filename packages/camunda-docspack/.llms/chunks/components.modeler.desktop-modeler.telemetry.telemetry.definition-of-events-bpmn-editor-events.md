# Telemetry — Definition of events — BPMN editor events

BPMN editor events are sent on different interactions with the BPMN editor:

- User created, appended, or replaced an element on the canvas. These events include the `oldElement`/`sourceElement` (when applicable) and the new element(s).
- User selected, updated, unlinked, or removed an element template from an element via the properties panel on the right side of the screen. These events include the current diagram `selection` and respective element templates.
- User interacted with the pop-up menu, context menu, or the palette. These events include the target (`entryId`, `entryGroup`, `entryTitle`) and `triggerType` (`"click"`, `"drag"`, or `"keyboard"`) of the interaction, as well as the current diagram `selection`.

Example event:

```json
{
  "entryId": "create.start-event",
  "entryGroup": "event",
  "entryTitle": "Start Event",
  "selection": [
    {
      "id": "StartEvent_1",
      "type": "bpmn:StartEvent",
      "templateId": "template-start-event"
    }
  ],
  "triggerType": "keyboard"
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
