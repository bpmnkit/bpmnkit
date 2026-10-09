# Zeebe API RPCs — `ActivateJobs` RPC — Errors

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- Type is blank (empty string, null)
- Worker is blank (empty string, null)
- Timeout less than 1 (ms)
- maxJobsToActivate is less than 1
- If multi-tenancy is enabled, and `tenantIds` is empty (empty list)
- If multi-tenancy is enabled, and an invalid tenant ID is provided. A tenant ID is considered invalid if:
  - The tenant ID is blank (empty string, null)
  - The tenant ID is longer than 31 characters
  - The tenant ID contains anything other than alphanumeric characters, dot (.), dash (-), or underscore (\_)
- If multi-tenancy is disabled, and `tenantIds` is not empty (empty list), or has an ID other than `<default>`

#### GRPC_STATUS_PERMISSION_DENIED

- If multi-tenancy is enabled, and an unauthorized tenant ID is provided

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
