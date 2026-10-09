# Microsoft 365 email inbound connector — Create a Microsoft 365 email inbound connector event — Email processing operations

Configure what happens to emails after they trigger a process. **At least one operation must be configured.**

- **Mark as read**: Mark the email as read after processing
- **Delete**: Delete the email after processing
  - **Force delete**: Bypass the deleted items folder and permanently delete
- **Move to folder**: Move the email to a different folder after processing. Select a **Folder Identifier Type** (folder ID or folder name) and specify the destination folder.

**Warning: Avoid Infinite Reprocessing Loops**
Ensure your processing operation removes emails from matching your filter criteria. If emails continue to match the filter after processing, they will be reprocessed on every polling cycle, potentially creating multiple process instances for the same email.

**Examples of dangerous configurations:**

- Disabling **Only Unread** filter (fetching all emails) and only using **Mark as read** (emails remain in the monitored folder and continue matching the filter)
- Moving emails to a different folder and then having another process or rule move them back to the monitored folder (they will match the filter again)

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
