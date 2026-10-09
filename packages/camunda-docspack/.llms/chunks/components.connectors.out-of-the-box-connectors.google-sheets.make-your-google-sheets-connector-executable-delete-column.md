# Google Sheets connector — Make your Google Sheets connector executable — Delete column

To delete a column, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select operation** section, select **Delete column**.
3. In the **Operation details** section, set the field **Spreadsheet ID** to the desired spreadsheet, in which a column
   will be deleted.
4. In the **Operation details** section, set the field **Worksheet ID** to the desired worksheet ID, in which a column
   will be deleted.
5. In the **Operation details** section, select **Index format** of desired index of column to be deleted. Refer to
   the [relevant appendix entry](#how-can-i-define-which-column-will-be-deleted) to find out more.
6. In the **Operation details** section, set the **Column letter index** to the desired column index.

#### Operation response

The following fields are available in the response variable:

- `action` - The action performed. In this case, it will always be **Delete column**.
- `status` - The status of the operation. If successful, it will always be "OK". Otherwise, it will be an error message.
- `response` - The response of the operation. In this case, it will always be **null**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-sheets
