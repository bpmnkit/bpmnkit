# App Integrations and Physical Tenants — Terminology

Three different concepts on this page use the word "tenant". Keep them apart:

| Term                   | Identifier         | What it is                                                                                           |
| :--------------------- | :----------------- | :--------------------------------------------------------------------------------------------------- |
| **Physical Tenant**    | `physicalTenantId` | An isolated execution unit inside one orchestration cluster. This is what the page describes.        |
| **Logical Tenant**     | `tenantId`         | Camunda's multi-tenancy within a single Physical Tenant. App Integrations does not route on it.      |
| Microsoft Entra tenant | `teams.tenantId`   | The Entra directory hosting the Teams app registration. Unrelated to Camunda tenancy of either kind. |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations
