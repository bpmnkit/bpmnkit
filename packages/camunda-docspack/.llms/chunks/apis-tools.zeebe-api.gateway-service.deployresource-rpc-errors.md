# Zeebe API RPCs — `DeployResource` RPC — Errors

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- No resources given.
- At least one resource is invalid. A resource is considered invalid if:
  - The resource type is not supported (e.g. supported resources include BPMN and DMN files)
  - The content is not deserializable (e.g. detected as BPMN, but it's broken XML)
  - The content is invalid (e.g. an event-based gateway has an outgoing sequence flow to a task)
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
