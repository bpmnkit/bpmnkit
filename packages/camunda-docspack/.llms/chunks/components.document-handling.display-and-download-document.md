# Display and download a document

Learn how to build a form for document preview and downloading, and display and download a document from a user task in Tasklist.

In this section, learn how to build a form for document preview and download, and display and download a document from a user task in Tasklist.


## Build a form for document preview and download

To display and allow downloading of a document you can use the [document preview component](https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-document-preview) in [forms](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference). Although this example focuses on [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index), you can also build a form for document preview and download in [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index).

**Note**
The document preview component offers previews in forms of PDF documents and images as the most common file types. Other document types are supported, but listed without the preview and show the file name with the option to download the file.

In the component's configuration, provide a document reference as an array of document metadata.

![document preview for form](./img/document-preview-in-form.png)

For example, an array may look as follows:

```
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

For an example of the document reference as an array on the page for the document preview form component, review our documentation on [document preview](https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-document-preview).

---
Source: https://docs.camunda.io/docs/next/components/document-handling/display-and-download-document
