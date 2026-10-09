# Authentication and authorization for Physical Tenants — gRPC authentication

gRPC clients specify the target Physical Tenant using the `Camunda-Physical-Tenant` request header (metadata in gRPC terms). Requests that omit the header route to the `default` Physical Tenant.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization
