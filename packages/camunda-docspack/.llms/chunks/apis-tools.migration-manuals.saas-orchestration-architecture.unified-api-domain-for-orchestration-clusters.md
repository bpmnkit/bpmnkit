# SaaS orchestration architecture — Unified API domain for Orchestration Clusters

Camunda 8.9 introduces a unified API domain for Orchestration Clusters. All services are now accessible under a single base URL:

| Service             | Unified URL (8.9)                                             |
| :------------------ | :------------------------------------------------------------ |
| Base / REST API     | `https://<region>.api.<camunda-domain>/<cluster-id>`          |
| Operate UI          | `https://<region>.api.<camunda-domain>/<cluster-id>/operate`  |
| Tasklist UI         | `https://<region>.api.<camunda-domain>/<cluster-id>/tasklist` |
| Admin (Identity) UI | `https://<region>.api.<camunda-domain>/<cluster-id>/admin`    |

Legacy hostnames (`*.zeebe.<camunda-domain>`, `*.operate.<camunda-domain>`, `*.tasklist.<camunda-domain>`, and `*.identity.<camunda-domain>`) continue to work in 8.9 and are internally routed to the unified service, but are deprecated and scheduled for removal in 8.10.

After the 8.10 release, only the Zeebe gRPC endpoint and the unified `*.api.*` endpoints will remain.

### Web app URLs require an explicit application path

From 8.9, you must include the application path (`/operate`, `/tasklist`, or `/admin`) when opening a web app. Requesting the cluster base URL on its own no longer opens a web app.

Before 8.9, Operate, Tasklist, and Admin ran as standalone applications, so the runtime could determine which frontend to serve and redirected the cluster base URL to the matching web app automatically. For example, `https://<region>.operate.camunda.io/<cluster-id>` redirected to `https://<region>.operate.camunda.io/<cluster-id>/operate`.

From 8.9, Operate, Tasklist, Admin, and the REST API are served by the same unified application, so the runtime cannot infer which frontend a request is for. The automatic redirect no longer happens, and the cluster base URL does not resolve to a web app.

Update any stored links that rely on the previous redirect, including browser bookmarks, links saved in external systems, and links embedded in processes or documentation created before 8.9. Each must point at the full path:

- `https://<region>.api.<camunda-domain>/<cluster-id>/operate`
- `https://<region>.api.<camunda-domain>/<cluster-id>/tasklist`
- `https://<region>.api.<camunda-domain>/<cluster-id>/admin`

To confirm the correct URL for a cluster, open the cluster in Camunda Console and use the launch links for Operate, Tasklist, or Admin.

If your organization uses [IP allowlisting](https://docs.camunda.io/docs/next/components/saas/clusters/manage-ip-allowlists), a request to the cluster base URL without an application path can return `403 Forbidden` rather than an obvious routing error, because the base path is subject to allowlist restrictions. A `403` on the base URL is therefore an expected symptom of a stored link that is missing its application path, not necessarily an allowlist misconfiguration.

**Note**
URLs extracted from the HTML of Camunda web UIs are not a stable interface and can change between releases. Use the documented URL formats above or the Console launch links instead of scraping links from the UI.

### Deprecation

Legacy hostnames are deprecated as of 8.9 and will be removed in 8.10. Migrate any hard-coded URLs for Operate, Tasklist, or Identity to the new unified `*.api.*` URLs during the 8.9 lifecycle to ensure readiness before the 8.10 release.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/saas-orchestration-architecture
