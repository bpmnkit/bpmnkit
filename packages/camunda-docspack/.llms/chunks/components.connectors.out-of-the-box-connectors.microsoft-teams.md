# Microsoft Teams connector

Work with Microsoft Teams from your BPMN process using the Microsoft Teams connector. Learn about authentication, conversation type and method, and more.

The **Microsoft Teams connector** is an outbound connector that allows you to connect your BPMN process with [Microsoft Teams](https://www.microsoft.com/microsoft-teams/) to manage interactions.

**Note**
If your organization uses [Camunda app integrations](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/app-integrations), the [App Integrations connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations) sends through the app your users already have connected, and carries no credentials in the process model.


## Prerequisites

To use the **Microsoft Teams connector**, you need to have a [Microsoft Teams](https://www.microsoft.com/microsoft-teams/) account and
relevant [permissions](https://support.microsoft.com/en-us/office/manage-team-settings-92d238e6-0ae2-447e-af90-40b1052c4547)
or the registered application in the [Azure Active Directory](https://aad.portal.azure.com/) (visit [how to register the app](https://learn.microsoft.com/en-us/graph/auth-register-app-v2) for more information) alongside
the relevant [Microsoft Graph API permissions](https://learn.microsoft.com/en-us/graph/permissions-reference).

**Note**
Use secrets to store credentials so you don't expose sensitive information directly from the process. See [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-teams
