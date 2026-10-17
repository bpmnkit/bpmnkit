# Template properties — Setting a task implementation

The following tasks support multiple implementation types:

- User task: [`zeebe:userTask`](#user-task-implementation-zeebeusertask) and [`zeebe:taskDefinition`](#task-definition-zeebetaskdefinition) (most related properties--for example, [Assignment](#user-task-assignment-zeebeassignmentdefinition), [Task schedule](#user-task-schedule-zeebetaskschedule), and [Priority](#user-task-priority-zeebeprioritydefinition)--are only supported when `zeebe:userTask` is set)
- Business rule task: [`zeebe:calledDecision`](#called-decision-zeebecalleddecision) and [`zeebe:taskDefinition`](#task-definition-zeebetaskdefinition)
- Script task: [`zeebe:script`](#script-zeebescript) and [`zeebe:taskDefinition`](#task-definition-zeebetaskdefinition)

You pick an implementation type by adding the respective binding with the respective type to your properties array.


## Setting a resource binding type

The task types listed below that can reference external resources also let you define the [resource binding type](https://docs.camunda.io/docs/next/components/best-practices/modeling/choosing-the-resource-binding-type):

- Call activity: [`zeebe:calledElement`](#called-element-zeebecalledelement)
- User task form: [`zeebe:formDefinition`](#form-zeebeformdefinition)
- Business rule task: [`zeebe:calledDecision`](#called-decision-zeebecalleddecision)

Setting a resource binding type helps you define what version of a resource (process, form, or decision) should be used during process execution.
Camunda generally recommends using `versionTag` as the resource binding type.
This helps to ensure that only resources with a matching `versionTag` are used during process execution.
By default, the binding type is `latest`, meaning that the latest deployed version of a resource is used whenever the task is executed.
Using `latest` in combination with element templates bears the risk that a resource can be changed in an incompatible way.
This can make invocations with old templates fail, for example, because an input mapping is missing from an old template, but is required by the updated resource.

The binding type can be set like so:

```json
{
  "properties": [
    ...,
    {
      "type": "Hidden",
      "value": "versionTag", // set binding type to versionTag
      "binding": {
        "type": "zeebe:calledElement", // or zeebe:formDefinition or zeebe:calledDecision
        "property": "bindingType"
      }
    },
    {
      "type": "Hidden",
      "value": "v1", // set the version tag to use
      "binding": {
        "type": "zeebe:calledElement",
        "property": "versionTag"
      }
    }
  ]
}
```

As you can see in the example above, the properties `bindingType` and `versionTag` are of type `Hidden`.
This is because these properties should generally not be changed by the user, unless the template author has very good reasons to allow this.
Should an update to the resource be necessary, you can create a new version of the template that uses a different version tag.

For further information, see the section on [element templates with dependencies](https://docs.camunda.io/docs/next/components/modeler/element-templates/element-template-with-dependencies).

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
