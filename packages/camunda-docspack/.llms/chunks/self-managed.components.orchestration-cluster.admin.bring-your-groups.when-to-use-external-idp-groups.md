# Bring your own groups — When to use external IdP groups

Use external IdP groups if:

- Your IdP is already the source of truth for user-to-group membership.
- You want a single place to manage group membership for both sign-in and Camunda authorization.
- You need group-based authorization in Camunda but do not want to duplicate group data between your IdP and Camunda.

Do not use external IdP groups if:

- You need to manage groups through the Orchestration Cluster REST API or Identity UI.
- You need Camunda to list or browse IdP-managed groups.
- You are running Camunda 8 SaaS.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/bring-your-groups
