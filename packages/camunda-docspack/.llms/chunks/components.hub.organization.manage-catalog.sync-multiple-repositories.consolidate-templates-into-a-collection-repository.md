# Sync assets from multiple repositories — Consolidate templates into a collection repository

Camunda recommends using a CI/CD job in each source repository that copies its element templates and READMEs into a dedicated collection repository whenever a new version is created. For example:

```yaml
# Example: GitHub Actions workflow in a source repository
name: Push templates to collection repo

on:
  push:
    branches: [main]

jobs:
  push-to-collection:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source repository
        uses: actions/checkout@v4

      - name: Push element templates to collection repo
        run: |
          git clone https://x-access-token:${{ secrets.COLLECTION_REPO_TOKEN }}@github.com/your-org/catalog-collection.git
          cp -r element-templates/payment-connector catalog-collection/payment-connector
          cd catalog-collection
          git add .
          git commit -m "Update payment-connector templates"
          git push
```

The collection repository then [syncs to Camunda Hub](https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started#run-the-sync).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/sync-multiple-repositories
