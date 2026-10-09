# IDP reference — Validation status {#status}

During validation, a validation status is shown for extraction fields to indicate the accuracy of the extracted data.

| Icon                                                                        | Status  | Description                                                                                                                     |
| :-------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------ |
|        | Pass    | The document validation passed with accurate and expected results.                                                              |
|  | Caution | A test case is missing for comparison. Click **Save test case** to create a test case for this field.                           |
|        | Fail    | The validation results do not match the expected output for the document. Click **Review document** to investigate and resolve. |

### Example

The following example shows the results of a partially successful extraction against three documents.

The expanded `contract_start_date` field shows that each document returned different validation results.

- The first document passed the validation, with the **Extracted value** matching the **Expected test case output**.
- The second document failed validation as the **Extracted value** did not match the **Expected test case output**. Click **Review document** to open the document again and check the prompt for this field.
- The third document could not be validated as a test case was not found for comparison. Click **Save test case** to create a test case for the document.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference
