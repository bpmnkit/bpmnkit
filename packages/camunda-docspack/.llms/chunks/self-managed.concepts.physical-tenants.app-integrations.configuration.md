# App Integrations and Physical Tenants — Configuration

Declare the tenants of a cluster in the `physicalTenants` array of your `config.yaml`:

```yaml
flavor: self-managed

clusters:
  - uuid: <unique-cluster-uuid>
    name: <cluster-display-name>
    urls:
      orchestration: https://<your-camunda-host>
      tasklist: https://<your-camunda-host>/tasklist
      operate: https://<your-camunda-host>/operate
    exporter:
      apiKey: <cluster-exporter-api-key>
    physicalTenants:
      - id: tenanta
        name: Tenant A
        urls:
          tasklist: https://<your-camunda-host>/physical-tenants/tenanta/tasklist
          operate: https://<your-camunda-host>/physical-tenants/tenanta/operate
      - id: tenantb
        name: Tenant B
        exporter:
          apiKey: <tenant-b-exporter-api-key>
        auth:
          audiences:
            zeebe: <tenant-b-audience>
        urls:
          tasklist: https://<your-camunda-host>/physical-tenants/tenantb/tasklist
          operate: https://<your-camunda-host>/physical-tenants/tenantb/operate
```

| Field                                | Required | Description                                                                                                                                                                                                        |
| :----------------------------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                 | Yes      | The `physicalTenantId`, matching the tenant configured on the orchestration cluster.                                                                                                                               |
| `name`                               | Yes      | Display name shown in the cluster selector, for Microsoft Teams or Slack.                                                                                                                                          |
| `urls.tasklist`                      | Yes      | The tenant's Tasklist URL. Accepts a plain URL or the `{ base, task }` object described in the [installation guide](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation#example-configuration-file). |
| `urls.operate`                       | Yes      | The tenant's Operate URL.                                                                                                                                                                                          |
| `urls.orchestration`                 | No       | Overrides the tenant's API base URL. Defaults to `<cluster orchestration URL>/physical-tenants/<id>`. Specify it without the `/v2` suffix, as at cluster level.                                                    |
| `exporter.apiKey`                    | No       | Identifies this tenant on an inbound exporter request that carries no `X-Physical-Tenant-Id` header.                                                                                                               |
| `connector.apiKey`                   | No       | A separate key for the App Integrations connector endpoints. Rotates independently of `exporter.apiKey`.                                                                                                           |
| `auth.audiences.zeebe`               | No       | Overrides the audience requested for this tenant's API calls. See [authentication](#authentication).                                                                                                               |
| `exposeDefaultTenant` _(on cluster)_ | No       | Whether the `default` tenant is selectable alongside the configured ones. Defaults to `false`.                                                                                                                     |

Note that `urls.tasklist` and `urls.operate` are required on every tenant: a tenant never inherits the cluster's web app URLs, because those point at the cluster's own `default` tenant.

### The default tenant

The `default` Physical Tenant represents the cluster itself and always uses the cluster's own URLs, never a `/physical-tenants/default/…` path.

- **No `physicalTenants` configured**: App Integrations synthesizes a single `default` tenant that takes the cluster's name and URLs. This is the behavior of every cluster configured before 8.10, and it needs no migration.
- **`physicalTenants` configured**: only the tenants you declare are offered. The `default` tenant is hidden, so users cannot accidentally read from the cluster-wide endpoint.
- **`physicalTenants` configured with `exposeDefaultTenant: true`**: the `default` tenant is added at the top of the list, in addition to the configured tenants.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations
