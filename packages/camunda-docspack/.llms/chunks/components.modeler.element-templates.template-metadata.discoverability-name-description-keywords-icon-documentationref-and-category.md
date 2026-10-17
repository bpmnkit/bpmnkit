# Template metadata — Discoverability: `name`, `description`, `keywords`, `icon`, `documentationRef`, and `category`

- `name` is a required key and must be set.
- `description`, `keywords`, `icon`, `documentationRef`, and `category` are optional key-value pairs.

These keys define the user-facing metadata of the template. They help the template users to discover and understand the purpose of the template.
They are shown when selecting a template and when the template has been applied to an element.

- `name : String` defines the name of the template.
- `description : String` provides additional information about the template.
- `keywords : Array<String>` list of keywords that can help users find this template. Keywords are used for search and filtering but are not displayed in the UI.
- `icon : Object` defines the templates icon. The icon contents must be a valid [data](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) or HTTP(s) URL. We recommend using square icons as they are rendered at 18x18 pixels on the canvas and 32x32 pixels in the properties panel.
- `documentationRef : String` URL pointing to the template's documentation. It is shown in the properties panel.
- `category : Object` defines a category used to group templates in the element template selection list. If not defined, the template will be displayed in the **Templates** section.
  - `id : String` required key that defines the unique identifier of the category.
  - `name : String` required key that defines the name of the category that the template is shown in.

It is generally a good idea to provide a proper description of you template. This helps users to understand the purpose of the template and how to use it.
In case you require more space to explain the template, you can also provide a `documentationRef` pointing to a more detailed documentation page.
This is particularly useful for templates that require external dependencies, such as custom connector implementations.

Another good practice is to use a custom icon for your template. This helps users to quickly identify the template in the selection modal and in the properties panel.
If you use the Camunda Hub's element template editor, you can upload an image and Camunda Hub will take care of encoding it as a data URL.

```json
{
  ...,
  "name": "Template 1",
  "description": "some description",
  "keywords": [
    "search alias",
    "create action"
  ],
  "icon": {
    "contents": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22' fill='none'%3E%3Ccircle cx='11' cy='11' r='9' fill='black'/%3E%3Ctext x='6.9' y='14.9' fill='white' style='font-family: Arial; font-size: 10px;'%3EM%3C/text%3E%3C/svg%3E"
  },
  "documentationRef": "https://example.com/docs/template-1",
  "category": {
    "id": "custom-templates",
    "name": "Custom Templates"
  },
  ...
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
