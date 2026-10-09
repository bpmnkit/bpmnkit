# Set up two isolated Physical Tenants — API walkthrough

| Client          | How to target `riskprod`                                                                                                                                                                                                                                             |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REST            | Prefix every request with `/physical-tenants/riskprod/`, for example `POST /physical-tenants/riskprod/v2/process-definitions/search`. Plain `/v2/...` requests always resolve to `default`.                                                                          |
| gRPC            | Send the `Camunda-Physical-Tenant: riskprod` header (metadata) on each call. Omitting it routes to `default`.                                                                                                                                                        |
| Java client     | Set `.physicalTenantId("riskprod")` when building the `CamundaClient`. This scopes both REST and gRPC calls made through that client, no separate REST configuration needed. See [Physical Tenants in the Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/physical-tenants). |
| Desktop Modeler | Change the deployment target's cluster URL to end in `/physical-tenants/riskprod/v2`, leave the tenant ID field unset.                                                                                                                                               |

To filter search results by tenant, you don't need a request parameter. The tenant is already fixed by which prefix, header, or client you used to make the call. A `riskprod`-scoped search never returns `default`'s data and vice versa.

For example, [create a process instance](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-process-instance.api) scoped to `riskprod`:

```bash
curl -X POST https://your-cluster/physical-tenants/riskprod/v2/process-instances \
  -H "Content-Type: application/json" \
  -d '{"processDefinitionId": "your-process-id"}'
```

And [complete a job](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/complete-job.api) for that same tenant, once a worker activates it:

```bash
curl -X POST https://your-cluster/physical-tenants/riskprod/v2/jobs/{jobKey}/completion \
  -H "Content-Type: application/json" \
  -d '{}'
```

Both requests use the `riskprod` prefix from the table above; the same pattern applies to any REST operation. For the full REST path reference and status code meanings, see [tenant-scoped REST API routing](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing#tenant-scoped-rest-api-routing) and [HTTP status codes](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing#http-status-codes).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
