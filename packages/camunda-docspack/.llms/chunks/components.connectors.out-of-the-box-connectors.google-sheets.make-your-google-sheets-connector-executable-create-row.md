# Google Sheets connector — Make your Google Sheets connector executable — Create row

To create a row, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to
   the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select operation** section, select **Create row**.
3. In the **Operation details** section, set the field **Spreadsheet ID** to the desired spreadsheet, in which a new row
   will be added.
4. _(optional)_ In the **Operation details** section, set the field **Worksheet name** to the desired worksheet, in
   which a new row will be added. Keep in mind that if not specified, a new row will be added to the first available
   worksheet in the desired spreadsheet.
5. _(optional)_ In the **Operation details** section, set the field **Row index** to the desired row index, where a new row will be
   added. Refer to the [relevant appendix entry](#what-is-a-row-index) to find out more. If not set, a new row will be appended to the last row.
6. In the **Operation details** section, set the field **Enter values** to the desired values, which will be added. This
   property requires [FEEL input](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction).

#### Operation response

The following fields are available in the response variable:

- `action` - The action performed. In this case, it will always be **Create row**.
- `status` - The status of the operation. If successful, it will always be "OK". Otherwise, it will be an error message.
- `response` - The response of the operation. In this case, it will always be **null**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-sheets
