# Defining templates — Optional keys

- [`version : Integer`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#identification-id-and-version): Property to support template versioning and upgrading. If you add a version to a template, it is considered unique based on its ID and version.
- [`description : String`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#discoverability-name-description-keywords-icon-documentationref-and-category): Description of the template. Shown in the element template selection modal and in the properties panel (after applying an element template).
- [`keywords : Array<String>`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#discoverability-name-description-keywords-icon-documentationref-and-category): List of keywords. Helps users find the template through search. Keywords are used for search and filtering but are not displayed in the UI.
- [`category : Object`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#discoverability-name-description-keywords-icon-documentationref-and-category): Category for the template. The template appears under the category name in the element template selection modal.
- [`documentationRef : String`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#discoverability-name-description-keywords-icon-documentationref-and-category): URL pointing to the template's documentation. Shown in the properties panel (after applying an element template).
- [`icon : Object`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#discoverability-name-description-keywords-icon-documentationref-and-category): Sets the template's icon. The icon is shown in the element template selection modal and in the properties panel (after applying an element template).
- [`engines : Object`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#engine-compatibility-engines): Dictionary of environments compatible with the template. The environment version is specified using a semantic version range.
- [`elementType : Object`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#supported-bpmn-types-appliesto-and-elementtype): Sets the type of the element. The element is replaced with the specified type when a user applies the template.
- [`groups : Object`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#grouping-properties-groups): Defines groups of property input fields. Groups are sections in the properties panel. Properties can be assigned a group.
- [`presets : Array<Object>`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#predefined-configurations-steps-and-presets): Defines reusable sets of property values. A preset is applied when a user selects its associated step.
- [`steps : Array<Object>`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#predefined-configurations-steps-and-presets): Defines a hierarchical menu of predefined configurations shown when the template is applied. Each final step applies a preset.

Some keys and values require other keys to be set. If your editor supports the [JSON schema](https://json-schema.org/), it will flag missing keys as errors. Camunda Hub's editor also shows these errors in the template editor problems panel.

Here is an example element template with the most commonly used keys:

```json
{
  "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
  "name": "Template 1",
  "id": "sometemplate",
  "description": "some description",
  "keywords": ["search alias", "create action"],
  "version": 1,
  "engines": {
    "camunda": "^8.6"
  },
  "appliesTo": ["bpmn:Task"],
  "elementType": {
    "value": "bpmn:ServiceTask"
  },
  "properties": [
    {
      "label": "Input Variable",
      "type": "String",
      "value": "someProcessVariable",
      "binding": {
        "type": "zeebe:input",
        "name": "anInputVariable"
      }
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates
