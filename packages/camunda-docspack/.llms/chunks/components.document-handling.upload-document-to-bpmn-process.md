# Upload a document to a BPMN process

Learn how to build a form for document upload, upload a document from a user task in Tasklist, upload a document to start a process, and more.

You can implement document uploads in your BPMN processes using [forms](#build-a-form-for-document-upload), [inbound connectors](#upload-a-document-via-inbound-webhook-connector), and the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-document.api).


## Build a form for document upload

When [building a form](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/utilize-forms) for a process, you can use the [Filepicker form component](https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-filepicker) to allow users to upload files.

In the Filepicker configuration, you can specify whether users can upload a single file or [multiple files](https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-filepicker#configurable-properties) and define the list of [supported file formats](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers).

Although this example focuses on [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index), you can also build a form for document upload in [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index). The Filepicker form component is available in both environments.

![Form with Filepicker](./img/form-with-file-picker.png)

A designed form can be [linked](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/advanced-modeling/form-linking) to a [user task](#upload-a-document-from-a-user-task-in-tasklist) or used to [start a process](#upload-a-document-to-start-a-process).
Documents uploaded with the form can then be [referenced](#get-reference-to-an-uploaded-document) later in the process.

The Filepicker always returns an array with metadata for a single or multiple files, for example:

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

### Upload a document from a user task in Tasklist

When the process is deployed and running, users can access and complete user tasks that include a form with the Filepicker component in [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist):

![User task form with a file picker for uploading an ID document in Tasklist](./img/task-with-file-picker-tasklist.png)

### Upload a document to start a process

You can configure a form with the Filepicker for a start event of a BPMN process to allow users to upload documents when initiating the process. This is supported in [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist) and is available to logged-in users.

**Note**

Only logged-in users can upload files when starting a process from Tasklist.

### Get reference to an uploaded document

Uploaded documents can be referenced later in the process.

Filepicker's output variable is an array of objects with document metadata.
It always returns an array of objects, whether a user uploads a single document or multiple documents.

Single document uploads are accessible using `value[1]` (since [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) uses 1-based indexing).

Refer to the example array below:

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

---
Source: https://docs.camunda.io/docs/next/components/document-handling/upload-document-to-bpmn-process
