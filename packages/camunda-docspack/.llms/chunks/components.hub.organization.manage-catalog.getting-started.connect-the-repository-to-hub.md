# Get started with the catalog — Connect the repository to Hub

Use a CI/CD job, such as the [example Sync Catalog GitHub Actions workflow](https://github.com/camunda/catalog-template/blob/main/.github/workflows/sync-catalog.yml), in your repository to authenticate with the Camunda Hub API and submit the current set of element templates to the catalog whenever the repository changes.

The job calls a single ingestion endpoint:

```
PUT <camunda-hub-api-base-url>/api/v2/catalog/assets/ingestion
```

The request body is `multipart/form-data` and represents the **complete desired state** of the catalog. For each asset, the request includes two parts:

- `readme`: The `README.md` file.
- `template`: The element template `.json` file

**Tip**
For the full request and response schema, see the **Ingest catalog assets** reference for [SaaS](https://docs.camunda.io/docs/next/apis-tools/hub-api-saas/specifications/ingest-catalog-assets.api) and [Self-Managed](https://docs.camunda.io/docs/next/apis-tools/hub-api-sm/specifications/ingest-catalog-assets.api).

Because the submission represents the full desired state, Camunda Hub [unpublishes](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/manage-asset-lifecycle#unpublish-an-asset) any asset that exists in the catalog but is absent from the submission.

**Note**
For large submissions, review the [ingestion limits](#ingestion-limits).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
