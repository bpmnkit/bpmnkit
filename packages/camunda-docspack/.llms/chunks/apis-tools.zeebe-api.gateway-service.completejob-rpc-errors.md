# Zeebe API RPCs — `CompleteJob` RPC — Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No job exists with the given job key. Note that since jobs are removed once completed, it could be that this job did exist at some point.
- No job exists with the given job key for the tenants the user is authorized to work with.

#### GRPC_STATUS_FAILED_PRECONDITION

Returned if:

- The job was marked as failed. In that case, the related [incident](https://docs.camunda.io/docs/next/components/concepts/incidents) must be resolved before the job can be activated again and completed.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
