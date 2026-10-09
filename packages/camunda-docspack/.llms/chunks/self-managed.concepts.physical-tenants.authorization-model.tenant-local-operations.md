# Authorization model for Physical Tenants — Tenant-local operations

Tenant-local operations are scoped to a single Physical Tenant and are accessed using the tenant-prefixed URL: `/physical-tenants/{physicalTenantId}/v2/...`. Authorization for these operations is determined by the requesting user's roles and permissions **within that specific tenant**.

The **default** Physical Tenant is accessed at `/v2/...` for backward compatibility, and also at `/physical-tenants/default/v2/...`.

### Tenant-local authorization scope

Tenant-local operations cover everything needed to run and manage process automation within a tenant:

| Category                 | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| **Deployment**           | Deploying and managing process definitions, decision tables, and forms |
| **Process instances**    | Starting, canceling, modifying, and querying process instances         |
| **User tasks**           | Assigning, completing, and querying user tasks                         |
| **Variables**            | Reading and writing process and scope variables                        |
| **Messages and signals** | Publishing messages and broadcasting signals                           |
| **History and audit**    | Querying completed instances, audit events, and incident history       |

### Tenant-local endpoint path examples

The following examples show the URL structure for tenant-scoped operations. Replace `{physicalTenantId}` with the configured tenant ID (for example, `tenanta` or `default`).

| Operation                | Endpoint path                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------- |
| List process definitions | `GET /physical-tenants/{physicalTenantId}/v2/process-definitions`                  |
| Deploy process           | `POST /physical-tenants/{physicalTenantId}/v2/deployments`                         |
| Start process instance   | `POST /physical-tenants/{physicalTenantId}/v2/process-instances`                   |
| List process instances   | `GET /physical-tenants/{physicalTenantId}/v2/process-instances`                    |
| Get user tasks           | `GET /physical-tenants/{physicalTenantId}/v2/user-tasks`                           |
| Complete user task       | `POST /physical-tenants/{physicalTenantId}/v2/user-tasks/{userTaskKey}/completion` |
| Get variables            | `GET /physical-tenants/{physicalTenantId}/v2/variables/{variableKey}`              |
| Publish message          | `POST /physical-tenants/{physicalTenantId}/v2/messages`                            |

For the full API reference, see the [Camunda API reference](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/overview).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model
