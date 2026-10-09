# Logical Tenants — Isolation of data and processes

Each tenant's data and processes are logically isolated from others. This ensures that one tenant's workflows, data models, and configurations do not interfere with or affect other tenants. Each tenant operates in a secure, independent space within the same Camunda 8 instance.


## Resource sharing

Logical multi-tenancy provides cost efficiency by allowing multiple tenants to share the same Camunda 8 installation and infrastructure. This reduces operational overhead while maintaining logical isolation between tenants.


## Efficient administration

Administrators can manage all tenants centrally using [Admin](https://docs.camunda.io/docs/next/components/admin/tenant). This unified management interface simplifies monitoring, configuration, and maintenance tasks across tenant environments.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/logical-tenants
