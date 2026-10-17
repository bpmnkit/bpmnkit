# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Task listener: `zeebe:taskListener`

| **Binding `type`**         | `zeebe:taskListener`                                                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `Hidden`                                                                                                                                                                                           |
| **Binding parameters**     | `eventType`: The event type of the listener. Supported values: `creating`, `assigning`, `updating`, `completing`, `canceling`.`retries`_(Optional)_: The number of retries for the listener. |
| **Mapping result**         | `<zeebe:taskListener eventType="[eventType]" type="[value]" retries="[retries]" />`                                                                                                                |

With the `zeebe:taskListener` binding, you can configure [task listeners](https://docs.camunda.io/docs/next/components/concepts/user-task-listeners) on user tasks.
The `value` (or `generatedValue`) of the property sets the listener job type.

```json
{
  ...,
  "appliesTo": [ "bpmn:UserTask" ],
  "properties": [
    {
      "type": "Hidden",
      "value": "my-completing-listener-type",
      "binding": {
        "type": "zeebe:taskListener",
        "eventType": "completing"
      }
    },
    {
      "type": "Hidden",
      "value": "my-creating-listener-type",
      "binding": {
        "type": "zeebe:taskListener",
        "eventType": "creating",
        "retries": "3"
      }
    }
  ]
}
```

**Note**
This binding only applies to elements of type `bpmn:UserTask`.

This binding only supports property `type` set to `Hidden`. You can't configure listeners through the properties panel; the template must fully define them.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
