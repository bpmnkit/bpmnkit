# API routing for Physical Tenants — MCP routing

MCP server endpoints follow the same path convention as the REST API and webapps:

```
/physical-tenants/{physicalTenantId}/mcp/...
```

There is no cluster-wide MCP endpoint.


## Tenant discovery

There is no cross-tenant discovery endpoint. A client cannot request a list of Physical Tenants it has access to in a single call. If you need to enumerate accessible tenants, probe each tenant's endpoint individually.


## gRPC routing

gRPC clients specify the target Physical Tenant using the `Camunda-Physical-Tenant` request header (metadata in gRPC terms). Requests that omit the header route to the `default` Physical Tenant.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing
