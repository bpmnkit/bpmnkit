# App Integrations and Physical Tenants

Configure one App Integrations deployment to serve several Physical Tenants, with per-tenant web apps, audiences, and notification routing.


## About

A single App Integrations deployment can serve every Physical Tenant of an orchestration cluster. Each tenant gets its own API endpoint, web app links, and notification rules, while the backend, its database, and the Microsoft Teams and Slack app registrations stay shared.

Physical Tenant support in App Integrations is available in Camunda 8.10 Self-Managed only. It is not available on SaaS.

**Note: Related pages**

- [Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index): How Physical Tenants isolate execution and storage
- [Authentication and authorization](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization): Identity deployment models and token routing
- [Microsoft Teams installation](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation): The full `config.yaml` reference

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations
