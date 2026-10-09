# Google Sheets connector — Make your Google Sheets connector executable — Create empty column or row

To create empty column or row, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to
   the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select operation** section, select **Create empty column or row**.
3. In the **Operation details** section, set the field **Spreadsheet ID** to the desired spreadsheet, in which new
   columns/rows will be added.
4. In the **Operation details** section, set the field **Worksheet ID** to the desired worksheet, in which new
   columns/rows will be added.
5. In the **Operation details** section, select the **Dimension**, which will be added.
6. _(optional)_ In the **Operation details** section, set the both of the **Start index** and **End index** fields, in
   which new columns/rows will be added. Keep in mind that **count starts from 0**. It's possible to leave these fields
   empty. In this case, a new column/row will be added in the end of the desired worksheet.

#### Operation response

The following fields are available in the response variable:

- `action` - The action performed. In this case, it will always be **Create empty column or row**.
- `status` - The status of the operation. If successful, it will always be "OK". Otherwise, it will be an error message.
- `response` - The response of the operation. In this case, it will always be **null**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-sheets
