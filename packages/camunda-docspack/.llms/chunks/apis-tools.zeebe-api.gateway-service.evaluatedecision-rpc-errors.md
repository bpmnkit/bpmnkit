# Zeebe API RPCs — `EvaluateDecision` RPC — Errors

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- No decision with the given key exists (if decisionKey was given).
- No decision with the given decision ID exists (if decisionId was given).
- Both decision ID and decision KEY were provided, or are missing.
- If multi-tenancy is enabled, and `tenantId` is blank (empty string, null)
- If multi-tenancy is enabled, and an invalid tenant ID is provided. A tenant ID is considered invalid if:
  - The tenant ID is blank (empty string, null)
  - The tenant ID is longer than 31 characters
  - The tenant ID contains anything other than alphanumeric characters, dot (.), dash (-), or underscore (\_)
- If multi-tenancy is disabled, and `tenantId` is not blank (empty string, null), or has an ID other than `<default>`

#### GRPC_STATUS_PERMISSION_DENIED

- If multi-tenancy is enabled, and an unauthorized tenant ID is provided

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
