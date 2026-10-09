# IDP concepts — Text extraction engines {#extraction-engines}

A text extraction engine determines how text is extracted from a document before the LLM processes its content. Different document types and quality levels benefit from different extraction approaches.

- **Lightweight parsing** (Fast Extract): For digitally generated PDFs where text is already embedded, a fast built-in parser can extract text without OCR, reducing processing time and cost.
- **OCR-based extraction** (AWS Textract, Azure Document Intelligence, GCP Document AI, ABBYY Vantage): For scanned or image-based documents, OCR engines provide high-accuracy text recognition from images. ABBYY Vantage is a third-party OCR engine that can be combined with any cloud provider's LLM.
- **Multimodal**: For LLMs that support vision capabilities, the document can be sent directly to the model for native interpretation, bypassing a separate text extraction step entirely.

You can select the extraction engine per unstructured extraction template during [extraction testing](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction#extract-data), [validation](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction#validate-extraction), and [publishing](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-unstructured-extraction#publish-template), to optimize accuracy, performance, and cost for each document type.

**Info**
For a full list of available extraction engines, see [text extraction engines](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference#extraction-engines).

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-key-concepts
