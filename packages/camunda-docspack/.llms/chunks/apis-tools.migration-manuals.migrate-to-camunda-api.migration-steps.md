# Migrate to the Orchestration Cluster API — Migration steps

To successfully migrate to the V2 Orchestration Cluster API, perform the following steps:

1. **Identify your current V1 endpoints**: Audit your application to catalog all V1 API calls currently in use.
1. **Map V1 endpoints to V2 equivalents**: Use the tables in this guide to find the corresponding V2 endpoints for each request.
1. **Update request and response structure**: Adapt your code to handle the new formats, renamed attributes, and data type changes as outlined in this guide.
1. **Update pagination logic**: Replace old pagination parameters with the new `page` object structure and cursor-based navigation.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api
