# Google Sheets connector — Make your Google Sheets connector executable — Get worksheet data

To get worksheet data, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select operation** section, select **Get worksheet data**.
3. In the **Operation details** section, set the field **Spreadsheet ID** to the desired spreadsheet, from which data will be retrieved.
4. In the **Operation details** section, set the field **Worksheet name** to the desired worksheet, from which data will be retrieved.

#### Operation response

The following fields are available in the response variable:

- `action` - The action performed. In this case, it will always be **Get worksheet data**
- `status` - The status of the operation. If successful, it will always be "OK". Otherwise, it will be an error message.
- `response` - The response of the operation. If the worksheet is empty, the response is **null**, else **array of rows (also array)**.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-sheets
