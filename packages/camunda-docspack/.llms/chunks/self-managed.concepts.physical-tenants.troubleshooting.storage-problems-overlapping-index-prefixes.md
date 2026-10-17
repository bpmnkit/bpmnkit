# Troubleshoot Physical Tenants — Storage problems — Overlapping index prefixes

Startup validation only rejects prefixes that are exactly identical. Prefixes where one is the leading substring of another, such as `eu` and `eu-west`, pass validation but cause `eu*` wildcard queries to match both tenants' indices. Use full tenant IDs as prefixes.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
