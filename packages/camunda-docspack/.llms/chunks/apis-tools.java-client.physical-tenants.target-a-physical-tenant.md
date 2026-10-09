# Physical Tenants — Target a Physical Tenant

Set the Physical Tenant on the client builder:

```java
CamundaClient client = CamundaClient.newClientBuilder()
    .physicalTenantId("teama")
    .build();
```

A Physical Tenant ID must be lowercase alphanumeric and at most 64 characters — an invalid value fails application startup rather than failing at request time.

The same setting is also reachable via plain client properties and environment variables, without going through the builder. The environment variable names differ depending on how you configure the client, which is an easy trap if you mix the two:

- Bare Java client: `CAMUNDA_PHYSICAL_TENANT_ID` and `CAMUNDA_PREFIX_PHYSICAL_TENANT_PATH`.
- [Camunda Spring Boot Starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started): `CAMUNDA_CLIENT_PHYSICALTENANTID` (see the [properties reference](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference)).

Setting `physicalTenantId` does three things:

- Adds the `Camunda-Physical-Tenant` gRPC metadata header to every gRPC call.
- Prefixes the REST base path with `/physical-tenants/teama` (for example, `https://your-cluster/physical-tenants/teama/v2/...`) for the per-tenant API.
- Leaves the cluster-scoped REST API (`/cluster/v2/...`, for example `newStatusRequest()`) unprefixed — it's never physical-tenant-scoped, since it reports on the cluster as a whole. If your configured REST address already carries a `/physical-tenants/<id>` segment, the client strips it again when building the cluster-scoped base.

If `physicalTenantId` is not set, the client targets the **default** Physical Tenant on both protocols.

### Using a pre-prefixed REST address

If your REST address already points at a tenant-specific path — for example, behind a reverse proxy that performs the routing — disable the automatic path prefix so the client does not insert the tenant segment a second time:

```java
CamundaClient client = CamundaClient.newClientBuilder()
    .physicalTenantId("teama")
    .restAddress(URI.create("https://your-proxy/teama"))
    .prefixPhysicalTenantPath(false)
    .build();
```

The client still appends the `/v2` API path to whatever address you configure, so leave it off your configured `restAddress`.

`prefixPhysicalTenantPath(false)` only affects the REST base path. The gRPC header is always sent when `physicalTenantId` is set, regardless of this setting.

With a blank (whitespace-only) `physicalTenantId`, the two protocols diverge in the bare client: the REST prefix is skipped, but the gRPC interceptor is still installed and sends an empty header value, since it's added whenever the configured value is non-null. The Spring Boot Starter normalizes blank to `null` before it reaches the client, so this only affects applications wiring the builder directly from their own configuration. Set the value to `null`, not an empty string, to target the default tenant.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/physical-tenants
