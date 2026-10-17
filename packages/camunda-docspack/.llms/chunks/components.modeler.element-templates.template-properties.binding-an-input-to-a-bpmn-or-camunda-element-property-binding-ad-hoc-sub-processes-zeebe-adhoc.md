# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Ad-hoc sub-processes: `zeebe:adHoc`

| **Binding `type`**         | `zeebe:adHoc`                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Valid property `type`s** | `Hidden`                                                                                                                             |
| **Binding parameters**     | `property`: The name of the property.Supported properties: `outputCollection`, `outputElement`, and `activeElementsCollection`. |
| **Mapping result**         | `<zeebe:adHoc [property]="[userInput]" />`                                                                                           |

The `zeebe:adHoc` binding marks a sub-process as ad-hoc when deployed to Zeebe. When configured, contained activities can be executed independently without following a predefined sequence flow.

#### Example

```json
{
  ...,
  "appliesTo": [ "bpmn:AdHocSubProcess" ],
  "elementType": { "value": "bpmn:AdHocSubProcess" },
  "properties": [
    ...,
    {
      "type": "Hidden",
      "binding": { "type": "zeebe:adHoc", "property": "outputCollection" },
      "value": "results"
    },
    {
      "type": "Hidden",
      "binding": { "type": "zeebe:adHoc", "property": "outputElement" },
      "value": "={ id: results._meta.id, name: results._meta.name, content: results }"
    }
  ]
}
```

#### Example with `activeElementsCollection`

```json
{
  ...,
  "appliesTo": [ "bpmn:AdHocSubProcess" ],
  "elementType": { "value": "bpmn:AdHocSubProcess" },
  "properties": [
    {
      "type": "Hidden",
      "binding": {
        "type": "property",
        "name": "cancelRemainingInstances"
      },
      "value": "false"
    },
    {
      "type": "String",
      "feel": "required",
      "binding": {
        "type": "property",
        "name": "completionCondition"
      }
    },
    {
      "type": "Hidden",
      "binding": { "type": "zeebe:adHoc", "property": "activeElementsCollection" },
      "value": "=anActiveElementsCollection"
    }
  ]
}
```

**Note**
The `zeebe:adHoc` binding can only be used with elements of type `bpmn:AdHocSubProcess`.

The `outputCollection` property defines where ad-hoc execution results are collected, while `outputElement` specifies the structure of each result item.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
