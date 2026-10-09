# Document preview

A form element to preview documents

A form element to preview and download documents.


## Configurable properties

#### General

- **Title**: Title displayed on top of the element.
  - Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **Document reference**: Data used to render documents.
  - Accepts an array of objects with document metadata.
  - Can only be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).
  - The resulting value must have the following structure:

```json
[
  {
    "documentId": "u123",
    "endpoint": "https://api.example.com/documents/u123",
    "metadata": {
      "fileName": "Document.pdf",
      "contentType": "application/pdf"
    }
  }
]
```

**Note**
When previewing documents that were uploaded via [Filepicker](https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-filepicker) in Tasklist, document references are handled automatically:

- Modifying the document’s metadata after upload may prevent the preview from working correctly.
- To use Camunda's document service without Filepicker, you must include the `contentHash` and `documentId` values.

#### Condition

- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the element.

#### Layout

- **Columns**: Space the field will use inside its row.
  - **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).

#### Appearance

- **Max height of preview container**: A number which will define the maximum height of each document preview. Any document with a bigger height will display a scroll bar.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-document-preview
