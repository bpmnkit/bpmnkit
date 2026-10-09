# Google Sheets connector — Make your Google Sheets connector executable — Create spreadsheet

To create a spreadsheet, take the following steps:

1. Set the required credentials in the **Authentication** section. Refer to
   the [relevant appendix entry](#how-can-i-authenticate-my-connector) to find out more.
2. In the **Select operation** section, select **Create spreadsheet**.
3. _(optional)_ In the **Operation details** section, set the field **Parent folder ID** to the desired parent, inside
   which a new spreadsheet will be created. Keep in mind that if not specified, a new spreadsheet will be created in the
   Google Drive root folder of a user who owns the OAuth token.
4. In the **Operation details** section, set the field **Spreadsheet name** to the desired spreadsheet name.

#### Operation response

The following fields are available in the response variable:

- `spreadsheetId` - ID of the newly created spreadsheet.
- `spreadsheetUrl` - Human-readable URL of the newly created spreadsheet.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-sheets
