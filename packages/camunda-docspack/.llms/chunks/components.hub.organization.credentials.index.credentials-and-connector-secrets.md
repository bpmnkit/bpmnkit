# Manage credentials — Credentials and connector secrets

Credentials and [connector secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets) work together rather than replacing each other:

|         | Connector secret                             | Credential                                                      |
| ------- | -------------------------------------------- | --------------------------------------------------------------- |
| Stores  | A single sensitive value, such as an API key | A complete, typed set of authentication and connection settings |
| Scope   | One cluster                                  | One or more environments, managed from your organization        |
| Used by | Any connector field that supports secrets    | A connector's credential field                                  |

A credential's sensitive fields reference secrets, so the secret is still where the sensitive value lives. Create the secret first, then reference it from the credential.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
