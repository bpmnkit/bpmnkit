# Configuration — Connectivity — Multi-client configuration (Physical Tenants)

A single `camunda.client.*` configuration targets exactly one [Physical Tenant](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index) (the default tenant, unless `physical-tenant-id` is set). To target multiple Physical Tenants from one Spring application, configure multiple named clients under `camunda.clients.<name>.*`:

```yaml
camunda:
  clients:
    finance:
      physical-tenant-id: finance
      primary: true
    risk:
      physical-tenant-id: risk
```

The map key is a free-form client name; it does not have to match the Physical Tenant ID. A `physical-tenant-id` must be lowercase alphanumeric and at most 64 characters — an invalid value fails application startup.

Each named client is a sparse overlay on top of the base `camunda.client.*` configuration — any property you don't set per client (address, auth, and so on) falls back to the shared `camunda.client.*` value.

At most one client may be marked `primary: true` — configuring more than one throws `IllegalArgumentException` at startup. If you configure only one client, it's implicitly primary. If you configure more than one client and mark none of them `primary: true`, there is no primary client at all: looking one up throws `IllegalStateException`, and the `camundaClientConfiguration` bean isn't registered.

Each client's resolved `auth.method` (its own `camunda.clients.<name>.auth.method`, overlaid on the base `camunda.client.auth.method`) must be the same across all clients — mixing resolved authentication methods in one application throws an `IllegalArgumentException` at startup. An unset method normalizes to `none`, so leaving it unset on one client and setting `none` explicitly on another is fine; unset and `basic` together is a conflict. Credentials themselves (client ID, secret, and so on) can still differ per client.

If you don't configure any `camunda.clients.*` entries, your application has a single, implicitly-named `default` client — existing single-client configuration is unaffected.

#### Access a named client

Each named client is also available as a Spring bean, named `<name>CamundaClient` (for example, `financeCamundaClient`). Kebab-case client names are camel-cased for the bean name (`camunda.clients.risk-eu` → `riskEuCamundaClient`). The primary client's bean is `@Primary`, so a plain `@Autowired CamundaClient` still resolves it, and the historical `camundaClient` bean name is preserved as an alias for the primary client — `@Qualifier("camundaClient")` and `getBean("camundaClient")` keep working.

To look up clients by name at runtime, inject `CamundaClientRegistry`. Injecting the registry does not eagerly instantiate every client — beans are resolved lazily on first lookup:

```java
@Autowired
private CamundaClientRegistry clientRegistry;

public void useFinanceClient() {
  CamundaClient financeClient = clientRegistry.get("finance");
  // ...
}
```

`CamundaClientRegistry` also provides `find(String)` (returns an `Optional`), `getPrimary()`, `clientNames()`, and `all()` (a `Map` of every configured client, keyed by name).

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
