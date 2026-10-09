# Template properties — Binding an input to a BPMN or Camunda element property: `binding`

The previous sections describe how to display a property to the user in the properties panel and how to configure its value.
These inputs need to be mapped to the underlying BPMN 2.0 XML or Camunda extensions by using a `binding` object.

The `binding` is an object with a mandatory `type` key and an additional parameter depending on the binding's `type` value.
`binding.type` defines what kind of BPMN or Camunda element is targeted by the binding.
The additional binding parameter is a key on the binding object--for example, `name`, `key`, or `property`.
That key-value pair defines the target for the default [`value`](#setting-a-default-value-value) or user input.

Note that adherence to the following bindings s is enforced by design.
If the template does not adhere to them, the modeler logs a validation error and ignores the respective element template.

To fully grasp the concept of bindings, it is helpful to have a good understanding of BPMN 2.0 XML and Camunda extensions.
If you want to learn more about a certain BPMN element and its properties, you can read through the BPMN section on [Tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/tasks), [Events](https://docs.camunda.io/docs/next/components/modeler/bpmn/events), and [Subprocesses](https://docs.camunda.io/docs/next/components/modeler/bpmn/subprocesses).
Each page on an element contains a description of its properties and an example XML representation.

**Info**
If a property cannot be set via any of the bindings described below, it cannot be set by an element template.
For example, multi-instance configurations cannot be set by an element template.

**Warning**
If you add multiple properties with equal `binding` objects, the behavior is undefined.

The **mapping result** in the following section uses `[userInput]` to indicate where the input provided by the user in the properties panel is set in the BPMN XML.
If the user provides no input, the value specified in [`value`](#setting-a-default-value-value) is displayed and used for `[userInput]`.
Square brackets, `[]`, are used to indicate what the binding parameters are mapped to in the XML.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
