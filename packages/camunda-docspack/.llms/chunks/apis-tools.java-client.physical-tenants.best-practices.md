# Physical Tenants — Best practices

### One client vs. multiple clients

Use a single client (default Physical Tenant, no `physicalTenantId` set) unless your application genuinely needs to operate across more than one Physical Tenant. If it does, prefer the [Spring Boot Starter's multi-client support](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration#multi-client-configuration-physical-tenants) over manually constructing and tracking `CamundaClient` instances — it centralizes lookup (`CamundaClientRegistry`) and lifecycle management for you.

### Connection pooling

Each `CamundaClient` instance maintains its own gRPC channel and REST connection pool. Running multiple clients (one per Physical Tenant) means multiple independent connection pools — there's no pooling shared across clients. Size your application's resource expectations accordingly when targeting many Physical Tenants from one process.

### Error handling for unauthorized tenant access

There is no dedicated exception type for Physical Tenant errors — the Java client surfaces them as its regular per-protocol exception, carrying the underlying status:

- **REST:** `ProblemException` (extends `ClientHttpException`) — call `code()` for the HTTP status and `details()` for the `ProblemDetail` body.
- **gRPC:** `ClientStatusException` — call `getStatus()` / `getStatusCode()`.

The status code for an unrecognized Physical Tenant ID differs by protocol, which matters more than the exception type:

- **REST** always returns `404 Not Found` for an unknown tenant. This comes from a pre-security filter that leaves unknown tenants to the catch-all routing chain, so it's returned regardless of whether the caller is authenticated.
- **gRPC** returns `404 Not Found` only when the API is unprotected (no authentication configured). With authentication enabled, an unknown tenant instead returns `UNAUTHENTICATED`, deliberately without echoing the tenant ID — so tenant existence isn't revealed to an unauthenticated caller.

If you're debugging a gRPC call that fails with `UNAUTHENTICATED`, don't assume it's a credentials problem — a typo'd or nonexistent Physical Tenant ID produces the same status on an authenticated cluster.

For the full breakdown of authorization outcomes at the API level (missing/invalid credentials vs. insufficient permission), see [How to determine who can access a tenant](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model#how-to-determine-who-can-access-a-tenant).

### Monitoring and logging across tenants

Built-in job worker metrics are tagged only by job type and action — not by client name or Physical Tenant. Running the same job type across several clients doesn't just lack a tenant dimension in these metrics: the series for each client collapse into one, since there's nothing to tell them apart by. The job worker actuator endpoint has the same gap — its response carries no client name, so a multi-client application sees indistinguishable duplicate entries for the same job type. This is usually the first place people look when a multi-tenant application's metrics don't add up.

If you run multiple client instances and need to distinguish their metrics, tag your own application-level metrics using `ActivatedJob.getPhysicalTenantId()` inside job handlers, or the client/tenant identifier you already have at hand when issuing other commands. There is no built-in tracing for multi-tenant operations today — this is left entirely to the application layer.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/physical-tenants
