# Set up two isolated Physical Tenants

A hands-on walkthrough for adding a strongly isolated second team to a Self-Managed cluster with Helm.


## About

Set up a second, strongly isolated Physical Tenant on an existing Camunda 8 Self-Managed cluster, with its own storage, identity, and backups.

In this scenario, a bank runs its day-to-day operations on one Camunda 8 cluster today, the always-present `default` Physical Tenant. Its Risk team is now onboarding, and compliance requires Risk's process data, identity provider, and backups to be fully separate from Operations, without a second cluster to operate. This is the internal-domain pattern from [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants): strong isolation for teams that must not blur, on one platform.

This guide assumes Kubernetes with the Camunda Helm chart and a shared Keycloak or external OIDC provider.

### rdbms

This guide's examples isolate the new tenant with a separate schema on the same PostgreSQL instance `default` already uses.

### es-os

The same steps apply, but isolate the new tenant with a distinct index prefix instead of a schema. See [Elasticsearch and OpenSearch storage](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation#elasticsearch-and-opensearch-storage) for the prefix rules.

Before starting, read [Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index) for the concepts this guide builds on. It links out to the [configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference), [Helm configuration guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-physical-tenants), and [API routing](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing) pages for full property and endpoint detail rather than repeating them here.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
