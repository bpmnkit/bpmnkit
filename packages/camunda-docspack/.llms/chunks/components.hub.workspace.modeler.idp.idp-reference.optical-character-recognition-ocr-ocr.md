# IDP reference — Optical Character Recognition (OCR) {#ocr}

Optical Character Recognition (OCR) technology is used by several [text extraction engines](#extraction-engines) to detect and extract text and layout from scanned or digital documents.

You can use the following OCR-based extraction engines:

- **AWS Textract**: Used for both structured and unstructured extraction with the AWS provider.
- **Azure Document Intelligence**: Used for unstructured extraction with the Azure provider.
- **GCP Document AI**: Used for both structured and unstructured extraction with the GCP provider.
- **ABBYY Vantage**: A third-party OCR engine available for unstructured extraction and document classification across all cloud providers. Requires the [ABBYY connector secrets](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration#abbyy-secrets) to be configured for your environment's cluster.

### AWS Textract OCR capabilities

Structured data extraction with the AWS provider uses Amazon Textract:

- Extracts text, layout, and key-value pairs.
- Supports horizontal text only.
- Supports English handwriting.
- Supported languages for typed characters: Spanish, German, French, Italian, Portuguese.

Known limitations:

- No language detection.
- No vertical text support.
- Limited support for complex custom fields.
- No detection of table headers.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference
