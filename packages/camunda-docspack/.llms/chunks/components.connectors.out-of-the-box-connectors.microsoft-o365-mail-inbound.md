# Microsoft 365 email inbound connector

Integrate Outlook email with Microsoft 365 in your processes.

The **Microsoft 365 Email Inbound connector** allows you to consume emails by monitoring [Microsoft 365](https://outlook.office.com/mail/) mailboxes and mapping them to your BPMN processes as start or intermediate events.


## Prerequisites

- A [Microsoft 365](https://outlook.office.com/mail/) mailbox to monitor.
- Sufficient access rights at [Microsoft Entra](https://entra.microsoft.com) to create a new app and set [Microsoft Graph](https://developer.microsoft.com/en-us/graph) permissions.
- Required Microsoft Graph API permissions for your application:
  - `Mail.Read` - Read emails from mailboxes.
  - `Mail.ReadWrite` - Read and modify emails (required for operations like mark as read, move, delete).

Learn more about [creating, configuring, and authorizing Microsoft Apps](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).

**Note**
Use secrets to avoid exposing your Microsoft credentials as plain text. Refer to our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail-inbound
