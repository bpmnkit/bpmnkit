# Camunda 8.10 APIs & Tools migration guide — Upgrade steps

Complete the following steps in this guide:

1. Upgrade to the latest official Camunda SDK versions.
1. If you generate clients from OpenAPI, regenerate them from the 8.10 specification.
1. Re-run compilation/type checks and address any errors.
1. Review and apply fixes for the breaking changes, deprecations, and supported environment changes below.

### API and SDK changes to migrate before Camunda 8.10

If you did not already migrate to the following APIs and SDKs during your 8.8 or 8.9 upgrade, Camunda recommends you perform these migrations before you upgrade to 8.10.

If you already performed these migrations, proceed to [Camunda 8.10 breaking changes, deprecations, and supported environment changes](#camunda-810-breaking-changes-deprecations-and-supported-environment-changes).

| 8.9 status                                                  | Component/Use                                                                       | Migrate to                  | Migrate by          |
| :---------------------------------------------------------- | :---------------------------------------------------------------------------------- | :-------------------------- | :------------------ |
| Deprecated | [V1 component APIs](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api)                 | Orchestration Cluster API   | Before Camunda 8.10 |
| Deprecated | [ZeebeClient](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-java-client)               | Camunda Java Client         | Before Camunda 8.10 |
| Deprecated | [Spring Zeebe SDK](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-spring-boot-starter)  | Camunda Spring Boot Starter | Before Camunda 8.10 |
| Deprecated | [Zeebe Process Test (ZPT)](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test) | Camunda Process Test (CPT)  | Before Camunda 8.10 |
| Deprecated | [Job-based user tasks](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks)       | Camunda user tasks          | Before Camunda 8.10 |

**Tip**
Learn more about API changes in the blog post [Upcoming API Changes in Camunda 8: A Unified and Streamlined Experience](https://camunda.com/blog/2024/12/api-changes-in-camunda-8-a-unified-and-streamlined-experience/).

### Camunda 8.10 breaking changes, deprecations, and supported environment changes

Review the actions required for the following 8.10 changes:

| Type                                                                  | Change                                                                                                                      |
| :-------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| Breaking change | [Search filters: `UserTaskFilter` process filters converted into advanced search filters](#usertask-process-filter)         |
| Breaking change | [`POST /v2/message-subscriptions/search` returns start event subscriptions](#message-subscription-type)                     |
| Breaking change | [Administration API (Self-Managed) migrated](#administration-api-self-managed-migrated)                                     |
| Behavioral change        | [Element instance search: advanced filters on `elementId` / `elementName` and `$or` support](#element-instance-advanced-or) |
| Behavioral change        | [Resource API now uses eventual consistency](#resource-eventual-consistency)                                                |
| Behavioral change        | [Deleting a process definition with running instances defers history deletion](#delete-draining)                            |
| Deprecated           | [Deprecated: GET resource content API](#deprecated-get-resource-content)                                                    |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-810
