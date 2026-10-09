# Microsoft 365 email inbound connector — Create a Microsoft 365 email inbound connector event — Mailbox configuration

In the **Mailbox** section, configure which mailbox and folder to monitor:

- **User ID/User Principal Name**: The email address or user principal name of the mailbox to monitor (for example, `user@company.com`).
- **Folder Identifier Type**: Select how to identify the folder to monitor:
  - **Folder ID** (default): Use a [well-known folder ID](https://learn.microsoft.com/en-us/graph/api/resources/mailfolder?view=graph-rest-1.0#properties) such as `inbox`, `drafts`, or `sentitems`, or a custom folder ID. Prefer this option when using well-known folders.
  - **Folder Name**: Use the display name of the folder. The name must be unique within the mailbox. Use this option for custom folders where you don't know the folder ID.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
