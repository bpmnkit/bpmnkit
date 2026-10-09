# IDP reference — Document language support {#languages}

IDP supports data extraction and processing of documents in multiple languages.

Language support depends on the [text extraction engine](#extraction-engines) you use. For example, with the AWS provider, IDP integrates with [Amazon Textract](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-textract), which supports multilingual text extraction and can detect and extract text in multiple languages. Other extraction engines (Azure Document Intelligence, GCP Document AI) also support multiple languages. Refer to the respective provider documentation for details.

**Note**
At the time of the 8.7 release (April 2025), Amazon Textract can detect printed text and handwriting from the Standard English alphabet and ASCII symbols, and can extract printed text, forms and tables in English, German, French, Spanish, Italian and Portuguese. Refer to [Amazon Textract FAQs](https://aws.amazon.com/textract/faqs/) for current information on supported languages.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference
