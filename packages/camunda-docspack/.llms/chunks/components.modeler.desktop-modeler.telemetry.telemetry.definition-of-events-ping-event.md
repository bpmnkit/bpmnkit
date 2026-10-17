# Telemetry — Definition of events — Ping event

The `Ping Event` is sent in the following situations:

- The modeler is opened (given that `Usage Statistics` option is enabled).
- `Usage Statistics` option is enabled for the first time.
- Once every 24 hours (given that `Usage Statistics` option is enabled).

The `Ping Event` also sends the list of plugins installed and flags defined:

```json
  "plugins": ["PLUGIN_NAME"],
  "flags": {
    "FLAG_NAME": "FLAG_VALUE"
  }
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/telemetry/telemetry
