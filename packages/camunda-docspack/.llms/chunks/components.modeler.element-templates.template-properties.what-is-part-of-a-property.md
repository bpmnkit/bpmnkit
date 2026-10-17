# Template properties — What is part of a property?

You build your template by adding property objects to the `properties` array.
The property object keys are divided into required and optional keys:

### Required keys

- [`binding : Object`](#binding-an-input-to-a-bpmn-or-camunda-element-property-binding): An object specifying how the property is mapped to BPMN or Camunda extensions.

### Optional keys

- [`type : "String" | "Text" | "Boolean" | "Dropdown" | "Hidden" | "Configuration"`](#setting-the-input-type-type): Defines the input type in the properties panel.
- [`value : String | Number | Boolean`](#setting-a-default-value-value): The default value used if the bound property is not yet set by the user or if the type is `Hidden`.
- [`generatedValue : Object`](#generating-a-value-generatedvalue): Configuration used to generate a value when the property is applied to an element.
- [`placeholder : String`](#setting-a-text-placeholder-placeholder): Placeholder text shown in the input field when it is empty.
- [`feel : "required" | "optional" | "static"`](#adding-feel-editor-support-feel): Defines whether the property supports FEEL expressions.
- `label : String`: Label text shown above the property input.
- `tooltip : String`: Tooltip text shown when hovering over the label.
- `description : String`: Description text shown below the property input.
- [`optional : Boolean`](#preventing-persisting-empty-values-optional): Controls whether properties persist empty values in the underlying BPMN 2.0 XML.
- [`constraints : Object`](#validating-user-input-constraints): A list of editing constraints applied to the property value.
- [`group : String`](#grouping-fields-group): The group that the property belongs to.
- [`condition : Object`](#showing-properties-conditionally-condition): A condition that controls when the property is active and visible.
- `id : String`: An identifier used to reference the property in conditional properties.
- [`editable : Boolean`](#preventing-edits-editable): Controls whether the property is editable in the properties panel.
- [`entriesVisible : Boolean | Object`](#control-visibility-of-default-properties-panel-entries-entriesvisible): Controls whether default properties are shown alongside properties defined in the element template.

Not all keys and values are compatible with each other.
Some keys or values require other keys to be set to a certain value, even if the key is marked as optional above.
For more information, see the documentation below.

If your editor (e.g. VS Code) offers validation based on JSON schema, these incompatibilities or missing key-value pairs are highlighted as you edit your template.
Camunda Hub's element template editor offers an additional problems panel that shows these errors with additional descriptions to help you better understand what needs to be fixed.
The Desktop Modeler shows these errors with additional descriptions in the output tab, when it tries to load an invalid template.

For most purposes, `binding`, `label`, `type`, and `value` are sufficient to define a property.

All property objects are defined inside the `properties` array:

```json
{
  "schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
  ...,
  "properties": [
    {
      "label": "Some property",
      "type": "String",
      "binding": {
        ...
      }
    },
    {
      "label": "Some other property",
      "type": "Number",
      "binding": {
        ...
      }
    },
    ...
  ]
}
```

For a comprehensive example showing how to create a REST connector template with all the concepts covered in this documentation, see the [complete template example](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-example) page.

The key-value pairs of the property object are explained in the following sections.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
