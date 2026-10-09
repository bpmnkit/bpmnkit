# Example IDP integration — Document extraction template

The document extraction template used in this example uses the following extraction fields and sample document.

| Field name      | Prompt                    |
| :-------------- | :------------------------ |
| invoiceType     | Find the type of invoice. |
| invoiceCustomer | The invoice customer.     |
| invoiceId       | The invoice ID.           |


## Upload document

In the first step of the process, a [user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks) and linked [form](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference) allows a document to be uploaded in Tasklist.

- The form uses the [Filepicker](https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-filepicker) form element to upload a document.
- The Filepicker element **Key** is set to `documents`. This is then bound to the **Document** input in the document extraction template.

**Info**
You can also use the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) to upload documents for IDP. To learn more about storing, tracking, and managing documents in Camunda 8, see [document handling](https://docs.camunda.io/docs/next/components/document-handling/getting-started).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-example
