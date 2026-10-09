# Google Sheets connector — Make your Google Sheets connector executable — Add values to spreadsheet

To add values to a spreadsheet, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select operation** section, select **Add values to spreadsheet**.
3. In the **Operation details** section, set the field **Spreadsheet ID** to the desired spreadsheet, in which a new
   value will be added.
4. _(optional)_ In the **Operation details** section, set the field **Worksheet name** to the desired worksheet, in
   which a new value will be added. Keep in mind that if not specified, a new value will be added to the first available
   worksheet in the desired spreadsheet.
5. In the **Operation details** section, set the field **Cell ID** to the desired cell, in which a new value a new value
   will be added. Use format ColumnRow (for example A1).
6. In the **Operation details** section, set the field **Value** to the desired value, which will be added in the
   desired cell.

#### Operation response

The following fields are available in the response variable:

- `action` - The action performed. In this case, it will always be **Add values to Spreadsheet**.
- `status` - The status of the operation. If successful, it will always be "OK". Otherwise, there will be an error message.
- `response` - The response of the operation. In this case, it will always be **null**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-sheets
