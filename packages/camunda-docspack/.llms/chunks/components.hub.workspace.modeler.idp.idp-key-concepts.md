# IDP concepts

Key intelligent document processing (IDP) concepts and terms, such as the difference between structured and unstructured documents.

When using IDP it is helpful to understand the following key concepts and terms.


## Structured and unstructured documents {#documents}

<!-- Your choice of extraction method depends on whether your documents contain structured or unstructured data. -->

Documents are typically classified as containing either structured or unstructured data.

### Structured documents {#structured}

Structured documents have a predefined, consistent layout and fixed format, such as rows and columns in a database or spreadsheet, or fields in a standardized form.

Data in a structured document has a fixed location. For example, the ID, date, and company name are always located in the same place.

Example structured documents include:

- Invoices/ customer records
- Forms
- Identity documents

<!-- Use [structured data extraction](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-structured-extraction) to extract data from this type of document. -->

### Unstructured documents {#unstructured}

Unstructured documents have a less defined, free-form layout that can be more difficult to extract structured data from, such as free-text paragraphs where key information is located in unpredictable places.

IDP uses an [LLM foundation model](#llms) to extract data from this document type.

Example unstructured documents include:

- Emails
- Reports
- Memos

<!-- Use [unstructured data extraction](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction) to extract data from this document type. -->

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-key-concepts
