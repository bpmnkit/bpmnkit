# IDP concepts — Document classification {#classification}

Document classification uses an [LLM foundation model](#llms) to analyze, categorize, and assign a document type to incoming documents based on their content.

- Create a [document classification template](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-classification) to define the document types you want to classify (such as invoices, contracts, or identity documents), test classification accuracy, and publish the template for use in your processes.
- Classification enables you to route different document types to the correct downstream process step or [document extraction](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-extraction) template.
- Classification accuracy is improved with well-defined document types (including clear descriptions and classification instructions) and a set of test documents that accurately represents each type of document you want to process.

### Fallback output value {#fallback}

The fallback output value is the value returned when a document cannot be classified as any of the defined types. By default, this value is `unclassified-document`, but you can customize it to align with your process routing logic.

### Preconfigured document types {#preconfigured-types}

IDP provides a set of preconfigured document types (such as invoice, contract, identity document) to help you get started quickly when creating a [classification template](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-document-classification#define-document-types). You can also create custom document types for categories specific to your business.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-key-concepts
