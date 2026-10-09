# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Called element: `zeebe:calledElement`

| **Binding `type`**         | `zeebe:calledElement`                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown``Boolean` (only for the `propagateAllParentVariables` and `propagateAllChildVariables` properties)              |
| **Binding parameters**     | `property`: The name of the property. Supported properties: `processId`, `bindingType`, `versionTag`, `propagateAllParentVariables`, `propagateAllChildVariables`. |
| **Mapping result**         | `<zeebe:calledElement [property]="[userInput]" />`                                                                                                                      |

The `zeebe:calledElement` binding allows you to configure a process called by a call activity.

You can set the value of the property `bindingType` to control the [resource binding type](https://docs.camunda.io/docs/next/components/best-practices/modeling/choosing-the-resource-binding-type).
We recommend setting the property `bindingType` to the value `"versionTag"` and setting the property `versionTag` to the value of the version tag of the process you want to call.

```json
[
  {
    ...,
    "value": "aProcessId",
    "binding": {
      "type": "zeebe:calledElement",
      "property": "processId"
    }
  },
  {
    ...,
    "value": "versionTag",
    "binding": {
      "type": "zeebe:calledElement",
      "property": "bindingType"
    }
  },
  {
    ...,
    "value": "v1",
    "binding": {
      "type": "zeebe:calledElement",
      "property": "versionTag"
    }
  },
  ...
]
```

#### Variable propagation

You can control automatic variable propagation between the parent process and the called process by using the `propagateAllParentVariables` and `propagateAllChildVariables` properties. These properties support only the `Boolean` and `Hidden` types and do not support FEEL expressions.

- `propagateAllParentVariables`: When you set this property to `true`, the engine copies all variables from the parent process to the called process.
- `propagateAllChildVariables`: When you set this property to `true`, the engine copies all variables from the called process back to the parent process when the called process completes.

```json
[
  {
    ...,
    "type": "Boolean",
    "value": true,
    "binding": {
      "type": "zeebe:calledElement",
      "property": "propagateAllParentVariables"
    }
  },
  {
    ...,
    "type": "Hidden",
    "value": "false",
    "binding": {
      "type": "zeebe:calledElement",
      "property": "propagateAllChildVariables"
    }
  },
  ...
]
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
