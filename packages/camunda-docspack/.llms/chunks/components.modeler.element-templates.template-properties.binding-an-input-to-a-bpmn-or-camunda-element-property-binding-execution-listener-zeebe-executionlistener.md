# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Execution listener: `zeebe:executionListener`

| **Binding `type`**         | `zeebe:executionListener`                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `Hidden`                                                                                                                                           |
| **Binding parameters**     | `eventType`: The event type of the listener. Supported values: `start`, `end`.`retries`_(Optional)_: The number of retries for the listener. |
| **Mapping result**         | `<zeebe:executionListener eventType="[eventType]" type="[value]" retries="[retries]" />`                                                           |

With the `zeebe:executionListener` binding, you can configure [execution listeners](https://docs.camunda.io/docs/next/components/concepts/execution-listeners) on any BPMN element that supports them.
The `value` (or `generatedValue`) of the property sets the listener job type.

```json
{
  ...,
  "entriesVisible": {
    "executionListeners": false
  },
  "properties": [
    {
      "type": "Hidden",
      "value": "my-start-listener-type",
      "binding": {
        "type": "zeebe:executionListener",
        "eventType": "start"
      }
    },
    {
      "type": "Hidden",
      "value": "my-end-listener-type",
      "binding": {
        "type": "zeebe:executionListener",
        "eventType": "end",
        "retries": "3"
      }
    }
  ]
}
```

**Note**
This binding only supports property `type` set to `Hidden`. You can't configure listeners through the properties panel; the template must fully define them.

When using this binding, set `entriesVisible` with `executionListeners` to `false`. Combining user-defined and template-defined execution listeners isn't supported.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
