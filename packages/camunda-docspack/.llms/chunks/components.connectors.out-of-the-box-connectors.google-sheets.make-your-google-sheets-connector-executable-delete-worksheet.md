# Google Sheets connector — Make your Google Sheets connector executable — Delete worksheet

To delete a worksheet, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select operation** section, select **Delete worksheet**.
3. In the **Operation details** section, set the field **Spreadsheet ID** to the desired spreadsheet, in which a worksheet will be deleted.
4. In the **Operation details** section, set the field **Worksheet ID** to the desired worksheet ID, which will be deleted.

#### Operation response

The following fields are available in the response variable:

- `action` - The action performed. In this case, it will always be **Delete worksheet**.
- `status` - The status of the operation. If successful, it will always be "OK". Otherwise, it will be an error message.
- `response` - The response of the operation. In this case, it will always be **null**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-sheets
