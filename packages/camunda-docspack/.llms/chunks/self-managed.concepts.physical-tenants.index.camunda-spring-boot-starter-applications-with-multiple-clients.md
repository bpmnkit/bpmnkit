# Physical Tenant isolation model — Camunda Spring Boot Starter applications with multiple clients

When you configure multiple clients in a [Camunda Spring Boot Starter application](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started), the starter registers every `@JobWorker` against all configured clients and deploys every `@Deployment` resource to all configured clients. Workers can therefore poll and process jobs across multiple Physical Tenants, and the same BPMN resources can be deployed to each tenant. See [Physical Tenant behavior for job workers](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration#physical-tenant-fan-out-for-multi-client-applications) and [deployment behavior for multi-client applications](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration#deploy-resources-on-start-up).


## Optimize deployment

Deploy Optimize separately for each Physical Tenant, as its own release, and point each instance at that tenant's exported records. For how to deploy Optimize per Physical Tenant and share one Management Identity across them, see [Optimize and Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/optimize).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index
