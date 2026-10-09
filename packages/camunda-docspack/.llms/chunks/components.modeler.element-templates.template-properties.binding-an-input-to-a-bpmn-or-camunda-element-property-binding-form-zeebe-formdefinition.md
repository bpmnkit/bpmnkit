# Template properties — Binding an input to a BPMN or Camunda element property: `binding` — Form: `zeebe:formDefinition`

| **Binding `type`**         | `zeebe:formDefinition`                                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Valid property `type`s** | `String``Text``Hidden``Dropdown`                                                                                |
| **Binding parameters**     | `property`: The name of the property.  Supported properties: `formId`, `externalReference`, `bindingType`, and `versionTag`. |
| **Mapping result**         | `<zeebe:formDefinition [property]="[userInput]" />`                                                                               |

The `zeebe:formDefinition` binding allows you to configure the [user task form](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks#user-task-forms) used by a user task.

When setting the `formId` property, you can set the value of the property `bindingType` to control the [resource binding type](https://docs.camunda.io/docs/next/components/best-practices/modeling/choosing-the-resource-binding-type).
We recommend setting the property `bindingType` to the value `"versionTag"` and setting the property `versionTag`
to the value of the version tag of the form you want to link.

```json
[
  {
    ...,
    "value": "aFormId",
    "binding": {
      "type": "zeebe:formDefinition",
      "property": "formId"
    }
  },
  {
    ...,
    "value": "versionTag",
    "binding": {
      "type": "zeebe:formDefinition",
      "property": "bindingType"
    }
  },
  {
    ...,
    "value": "v1",
    "binding": {
      "type": "zeebe:formDefinition",
      "property": "versionTag"
    }
  },
  ...
]
```

**Note**

When `zeebe:formDefinition` is used, [`zeebe:userTask`](#user-task-implementation-zeebeusertask) must be set on the same element.
Properties `formId` and `externalReference` are mutually exclusive, meaning that only one of them can be set at a time.
The property `externalReference` cannot be used together with `bindingType`.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
