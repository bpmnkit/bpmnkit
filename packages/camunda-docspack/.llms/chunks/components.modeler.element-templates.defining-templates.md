# Defining templates

Learn how to define an element template

An element template is defined in a template descriptor files as a JSON object.
The element template object is divided into required and optional key-value pairs:


## Required keys

- [`$schema : String`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#validation-schema): URI pointing towards the [JSON schema](https://json-schema.org/) which defines the structure of the element template `.json` file. Element template schemas are maintained in the [element templates JSON schema](https://github.com/camunda/element-templates-json-schema) repository.
- [`id : String`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#identification-id-and-version): Identifier of the template.
- [`name : String`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#discoverability-name-description-keywords-icon-documentationref-and-category): Name of the template. Shown in the element template selection modal and in the properties panel on the right side of the screen (after applying an element template).
- [`appliesTo : Array<String>`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#supported-bpmn-types-appliesto-and-elementtype): List of BPMN element types the template can be applied to.
- [`properties : Array<Object>`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties): List of properties that the template applies to the BPMN element. Each property object defines the type of input and how its value is bound to a BPMN or Camunda extension property.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates
