# Extract structured data — Step 2: Configure template {#configure}

After the extraction process of the sample document is complete, you can configure the template to include only the fields and tables you want to be part of your template.

1. Select the fields you want to include in your template by clicking the checkbox next to each field.

   ![Extracted fields and tables - select fields](img/extracted-fields-and-tables-configure.png)

2. Select the tables you want to include in your template by clicking the checkbox next to each table.

   ![Extracted fields and tables - select table](img/extracted-fields-and-tables-configure-tables.png)

### Extracted Fields

- **Field name:** Enter a descriptive name for the field, used to identify the field in your template. You can change the name as required.
- **Key:** The field key. This matches the key of the extracted field from the uploaded document.
- **Value:** The extracted value.
- **Confidence score:** How confident the model is in the extracted value.

### Extracted Tables

- **Table name:** Enter a descriptive name for the table, used to identify the table in your template. You can change the name as required.
- **Min confidence score:** The minimum confidence score of a field in the table.
- **Average confidence score:** The average confidence score of all fields in the table.

Once you are satisfied with your template configuration, you can test it to validate how well it performs on other documents, or you can publish it directly from this tab.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-structured-extraction
