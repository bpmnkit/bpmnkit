# Template metadata — Supported BPMN types: `appliesTo` and `elementType`

- `appliesTo` is a required key and must be set.
- `elementType` is an optional key that can be required under some circumstances, see below for more information.

These two key-value pairs define what BPMN types the template can be applied to (`appliesTo`) and whether the element is replaced with a different type when the template is applied (`elementType`).

- `appliesTo : Array<String>`: specifies the BPMN types the template can be applied to. The template will only be selectable for these types of elements in the modeler. Currently, element templates may be used on the following BPMN elements:
  - `bpmn:Activity` (including user tasks, service tasks, call activities, ad-hoc subprocesses, and others)
  - `bpmn:SequenceFlow` (for maintaining `condition`)
  - `bpmn:Process`
  - `bpmn:Event`
- `elementType : Object`: If you configure `elementType` on a template, the element is replaced with the specified type when a user applies the template.
  - `value : String`: Is a required key. The BPMN element is changed to this type the template is applied.
  - `eventDefinition: String`: This key is used when templating an event. It can be ignored when templating any other element type. Supported values are:
    - `"bpmn:MessageEventDefinition"` use this value when you template a message event.
    - `"bpmn:SignalEventDefinition"` use this value when you template a signal event.
    - `"bpmn:TimerEventDefinition"` use this value when you template a timer event.

Some properties require a specific BPMN type, and thus a specific value for `elementType`, to work correctly.
For example, if the template sets `zeebe:calledDecision` on an element and `appliesTo` is set to `bpmn:Task`, the `elementType` must be set to `bpmn:BusinessRuleTask`.
These constraints are checked based on the [element template schema](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#validation-schema) by your editor (if it supports JSON schema) and by the modeler when it loads the templates.

```json
{
  ...,
  "appliesTo": [
    "bpmn:Task"
  ],
  "elementType": {
    "value": "bpmn:ServiceTask"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
