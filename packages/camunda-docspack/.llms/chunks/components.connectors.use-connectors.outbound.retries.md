# Use an outbound connector — Retries

By default, connector execution is repeated `3` times if execution fails. The retries are executed sequentially without delays.

To change the default retries value, edit the BPMN XML file and set the `retries` attribute at the `zeebe:taskDefinition`. For example:

```xml
...
<zeebe:taskDefinition type="io.camunda:http-json:1" retries="12" />
...
```

The connector runtime also supports custom intervals between retries (**retry backoff**). To configure a custom retry interval, you need to add a special property to the connector element template. The property must bind to the `retryBackoff` task header, and the value must be a valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) duration.

```json
{
  "value": "PT30S",
  "binding": {
    "key": "retryBackoff",
    "type": "zeebe:taskHeader"
  },
  "type": "Hidden"
}
```

In the example above, the retry attempts will be spaced 30 seconds apart, instead of the default behavior of retrying immediately.

If necessary, the **retry backoff** property can be made visible and editable in the properties panel by changing the property `type` to `String`.

`retryBackoff` is a reserved task header key recognized by the connector runtime. You don't need to handle this input in your connector implementation, as the runtime handles it automatically for all outbound connectors.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/outbound
