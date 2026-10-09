# Telemetry — Definition of events — Tracked click events

The `Tracked Click Events` are sent when a user clicks a link or button contained within a tracked parent 'container'.

Currently, these containers are:

- Each of the welcome page columns
- The version info overlay

The event supplies:

- The `parent` container ID to locate the application section
- The button label or link text (generalized as label) for identification of what was specifically clicked
- A type to differentiate buttons, internal links, and external links
- The link target (optional for external links)

Example event:

```json
{
  "type": "[button or external-link or internal-link]",
  "parent": "welcome-page-learn-more",
  "label": "Click here to read more about Camunda",
  "link": "https://camunda.com/"
}
```

**Note**
`"link"` is only present for `"type": "external-link"`.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
