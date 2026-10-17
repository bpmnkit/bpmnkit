# Defining templates — Creating multiple templates in one file

You can define multiple templates in one JSON file by wrapping them in an array.

**Warning**
This is a Desktop Modeler-specific feature. Camunda Hub requires each template to be in a separate file.

```json
[
  {
    ...
    "name": "Template 1",
    "id": "some-template-id",
    "description": "some description",
    ...
  },
  {
    ...
    "name": "Template 2",
    "id": "another-template-id",
    "description": "another description",
    ...
  }
]
```


## Creating and editing templates

You can create and edit element templates in the text editor of your choice.
Connector templates are a specific type of element template, so the same applies to them.
If your editor supports the [JSON schema](https://json-schema.org/), it will recognize the structure of the template and provide additional editing support, such as formatting, code completion, and error highlighting.

[Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates) offers a built-in template editor with validation and error highlighting, as well as a live preview of the properties panel with the applied template.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates
