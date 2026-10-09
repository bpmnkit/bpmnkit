# Display and download a document — Display and download a document from a user task in Tasklist

A document can be displayed in a user task form in [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist).

When a user opens the task, they can view and download the document directly from the form.

![Document preview for task in Tasklist](./img/task-with-document-preview-tasklist.png)


## View and download a document in Operate

When a process instance variable references a document, you can preview and download that document directly from the **Variables** tab in the process instance detail view.

![Document reference variables in the Operate Variables tab](./img/document-preview-in-operate.png)

Document variables display the document's file name, type, and size. You can preview supported formats (PDF, JSON, plain text, PNG, JPG) directly in Operate, or download any document to your local machine. Use the **All / Documents** filter to show only document variables in the table.

This works the same whether the document came from a form, a connector, or an [AI Agent tool call](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-documents).

To inspect the underlying document reference metadata (such as document ID), expand the variable row.

---
Source: https://docs.camunda.io/docs/next/components/document-handling/display-and-download-document
