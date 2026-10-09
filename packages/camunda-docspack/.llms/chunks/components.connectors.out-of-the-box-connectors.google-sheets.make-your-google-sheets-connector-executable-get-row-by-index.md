# Google Sheets connector — Make your Google Sheets connector executable — Get row by index

To get row by index, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select operation** section, select **Get row by index**.
3. In the **Operation details** section, set the field **Spreadsheet ID** to the desired spreadsheet, from which a row
   will be retrieved.
4. _(optional)_ In the **Operation details** section, set the field **Worksheet name** to the desired worksheet, from
   which a row will be retrieved. Keep in mind that if not specified, a row will be retrieved from the first available
   worksheet in the desired spreadsheet.
5. In the **Operation details** section, set the field **Row index** to the desired row index. Refer to
   the [relevant appendix entry](#what-is-a-row-index) to find out more.

#### Operation response

The following fields are available in the response variable:

- `action` - The action performed. In this case, it will always be **Get row by index**.
- `status` - The status of the operation. If successful, it will always be "OK". Otherwise, it will be an error message.
- `response` - The response of the operation. If row is empty, the response is **null**, else **array**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-sheets
