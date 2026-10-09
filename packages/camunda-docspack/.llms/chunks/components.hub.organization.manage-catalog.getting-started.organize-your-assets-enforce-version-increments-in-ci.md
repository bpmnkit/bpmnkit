# Get started with the catalog — Organize your assets — Enforce version increments in CI

Instead of relying on reviewers to ensure the version is incremented for all modified assets, validate the version automatically before the submission ever reaches the catalog. Add a check to your CI pipeline that compares each changed element template against its previous state and fails the pull request when the content changed but the `version` field did not increase.

The example repository includes a [version-check GitHub Actions workflow](https://github.com/camunda/catalog-template/blob/main/.github/workflows/check-versions.yml) that runs on every pull request, so a template change with a stale `version` is caught before it is merged and synced. You can bypass the check for intentional exceptions by adding the `skip-version-check` label to the pull request.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
