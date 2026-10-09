# Document classification

Document classification templates use LLMs to automatically classify documents by type, such as invoices, contracts, or identity documents.

Automatically classify documents by type using LLM-powered classification templates.


## About document classification

Document classification templates use [LLM foundation models](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-key-concepts#llms) to analyze and categorize documents into defined types based on their content. For example, incoming documents can be classified as invoices, contracts, identity documents, or any custom type you define.

- Create a document classification template to categorize documents before routing them to the appropriate process step or [document extraction](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-extraction) template.
- Classification templates are published as connector templates that can be [integrated into your processes](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-integrate), enabling you to route different document types to the correct downstream automation.
- Choose and test different LLM models to find the model that best suits your budget and accuracy requirements.

**Important**
Document classification templates require an environment on version 8.9 or later.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-classification
