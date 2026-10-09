# Extract structured data — Step 3: Test data extraction (optional) {#test}

Testing is optional but recommended, as you can evaluate the performance of the extraction template before publishing.

Testing allows you to see how accurately the template extracts data from other documents of the same type. This ensures better results when using the template in your processes.

![Upload document for testing](img/idp-upload-test-template-empty.png)

To test the data extraction:

1. Drag your test document in the box or click **Drag and drop a PDF file here or click to upload a file** to browse and upload your test document.
2. Once you have finished uploading your test document, click **Test extraction template**.
3. The extraction process starts looking for the fields and tables you have selected in your template.

![Extracted fields and tables - test](img/idp-upload-test-template.png)

### Test summary results

After the extraction is complete, a summary of the test results is shown.

- **Average confidence**: The overall confidence score (as a percentage) for all extracted data.
- **Average number of fields extracted**: Number of fields successfully extracted compared to the total expected (for example, "3 / 3").
- **Average number of tables extracted**: Number of tables successfully extracted compared to the total expected (for example, "0 / 1").

### Detailed results

The detailed results section provides a comprehensive view of each tested document:

- **Filename**: The name of the uploaded test document.
- **Avg. confidence**: A visual confidence bar showing the extraction confidence as a percentage.
- **Extracted fields**: Number of successfully extracted fields out of the total.
- **Extracted tables**: Number of successfully extracted tables out of the total.
- **Actions**:
  - **View Extraction**: Click to see the detailed extraction results for each field and table.
    ![View Extraction test template](img/idp-test-template-view-extraction.png)
  - **Remove**: Delete the test document from the results.

You can test multiple documents by:

- Clicking **Upload documents** to add more test files.
- Clicking **Rerun tests** to test additional documents.

![Extracted test templates](img/idp-extracted-test-template.png)

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-structured-extraction
