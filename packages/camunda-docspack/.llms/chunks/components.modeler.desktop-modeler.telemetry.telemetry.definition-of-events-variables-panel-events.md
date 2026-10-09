# Telemetry — Definition of events — Variables panel events

Variables panel events are sent on different interactions with the [Variables](https://docs.camunda.io/docs/next/components/modeler/data-handling#inspecting-variables) panel:

- User opened the variables panel.
- User closed the variables panel.
- User filtered variables using the search input. The search term is not included in the event.
- User expanded or collapsed a scope section.
- User expanded or collapsed a variable row.
- User copied a variable name via the copy button.
- User copied a variable path or value via the context menu.

These events do not include any additional payload data.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
