# Template properties

Learn how to define template properties including types, bindings, constraints, and advanced features.

The `properties` array is where you define what properties should be applied to the BPMN element and how the properties panel will present these properties to the user when the template is applied.
The underlying concept is very simple:

1. You will create one property object for each property that should be defined by the template.
2. Each property object contains key-value pairs to define how the property is presented and how its value can be changed by the user.
3. Each property object contains one `binding` object that specifies how the property is mapped to BPMN 2.0 XML.

Element templates can only set properties that can be described by bindings supported by the element template schema.
You can find the full list of supported bindings in the [bindings](#binding-an-input-to-a-bpmn-or-camunda-element-property-binding) section.

When the user applies a template, the properties panel hides all BPMN 2.0 XML and Camunda extension element properties that can be defined by bindings in an element template.
The template author must explicitly make the properties user-configurable to show them in the properties panel once the user has applied the template.
For example, if a template does not contain a property object with the binding type `zeebe:input`,
the template user will not be able to define an input mapping for the element once the template is applied.

**Info**
Some properties &mdash; such as element documentation and multi-instance configurations &mdash; cannot be set by element templates.
They are situational and require knowledge of the process context to be used.
As they are never part of any element template, users can configure them independently of an applied template.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
