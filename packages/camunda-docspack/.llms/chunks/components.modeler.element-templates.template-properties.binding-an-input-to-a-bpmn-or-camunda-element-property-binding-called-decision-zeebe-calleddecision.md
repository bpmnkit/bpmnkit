# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Called decision: `zeebe:calledDecision`

| **Binding `type`**         | `zeebe:calledDecision`                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown`                                                                                |
| **Binding parameters**     | `property`: The name of the property. Supported properties: `decisionId`, `resultVariable`, `bindingType`, and `versionTag`. |
| **Mapping result**         | `<zeebe:calledDecision [property]="[userInput]" />`                                                                               |

The `zeebe:calledDecision` binding allows you to configure the [called decision](https://docs.camunda.io/docs/next/components/modeler/bpmn/business-rule-tasks#defining-a-task) used by a business rule task.

You can set the value of the property `bindingType` to control the [resource binding type](https://docs.camunda.io/docs/next/components/best-practices/modeling/choosing-the-resource-binding-type).
We recommend setting the property `bindingType` to the value `"versionTag"` and setting the property `versionTag`
to the value of the version tag of the decision you want to call.

```json
[
  {
    ...,
    "value": "aDecisionId",
    "binding": {
      "type": "zeebe:calledDecision",
      "property": "decisionId"
    }
  },
  {
    ...,
    "value": "aResultVariable",
    "binding": {
      "type": "zeebe:calledDecision",
      "property": "resultVariable"
    }
  },
  {
    ...,
    "value": "versionTag",
    "binding": {
      "type": "zeebe:calledDecision",
      "property": "bindingType"
    }
  },
  {
    ...,
    "value": "v1",
    "binding": {
      "type": "zeebe:calledDecision",
      "property": "versionTag"
    }
  },
  ...
]
```

**Note**
When `zeebe:calledDecision` is used, `zeebe:taskDefinition` cannot be used on the same element.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
