# Get started with the catalog — Connect the repository to Hub — Run the sync

The sync script in the example repository:

1. Obtains an access token.
2. Discovers each [asset directory](#organize-your-assets).
3. Builds the multipart request.
4. Submits the full desired state to the ingestion endpoint.

The included GitHub Actions workflow syncs the catalog on every push to `main`. You can also run it locally from the root of your asset repository:

```bash
bash scripts/sync-catalog.sh
```

A successful ingestion returns `204 No Content`. If the submission is invalid, the request fails with a `4xx` status, and no changes are applied; the ingestion is validated and applied as a single transaction.

For the full list of status codes and error responses, see the **Ingest catalog assets** reference for [SaaS](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/ingest-catalog-assets.api) or [Self-Managed](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/ingest-catalog-assets.api).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
