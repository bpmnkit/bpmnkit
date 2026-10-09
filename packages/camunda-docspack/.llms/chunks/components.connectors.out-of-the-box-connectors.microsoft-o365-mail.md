# Microsoft 365 connector

Integrate Outlook email with Microsoft 365 in your processes.

The Microsoft 365 Connector is an outbound connector that allows you to connect your BPMN service with [Microsoft 365](https://outlook.office.com/mail/) mail to send emails, read emails, and manage folders.


## Prerequisites

- A [Microsoft 365](https://outlook.office.com/mail/) mail instance.
- Sufficient permissions in [Microsoft Entra](https://entra.microsoft.com) to:
  - Create a new app registration
  - Configure [Microsoft Graph](https://developer.microsoft.com/en-us/graph) permissions
  - Assign the app to a user

Learn more about [creating, configuring, and authorizing a Microsoft app](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).

**Note**
Use secrets to avoid exposing your Microsoft credentials as plain text.
Refer to our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-o365-mail
