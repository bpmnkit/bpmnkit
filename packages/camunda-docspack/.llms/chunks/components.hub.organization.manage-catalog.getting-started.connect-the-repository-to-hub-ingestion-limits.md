# Get started with the catalog — Connect the repository to Hub — Ingestion limits

The ingestion endpoint enforces the following limits per request:

| Limit                | Value |
| -------------------- | ----- |
| Maximum files        | 5,000 |
| Maximum payload size | 20 MB |

Each asset consists of two files (a `README.md` and an element template), so a 5,000-file limit supports up to 2,500 assets.

<!--- TODO: add link for configuration properties when it exists --->

In Self-Managed, you can raise these limits using standard Spring configuration properties.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
