# Manage credentials — Credentials and environments

A credential is deployed to environments, not to clusters. An environment is the unit Camunda Hub tracks a credential's targets, values, and health against.

- On Camunda 8 SaaS, and on any cluster before 8.10, a cluster holds a single environment, named after the cluster.
- On Self-Managed 8.10 and later, a cluster holds one environment for each [Physical Tenant](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants). The environment for the `default` Physical Tenant uses the cluster name, and every other environment uses its Physical Tenant ID.
- Camunda Hub shows an environment by its name, and adds the cluster name in parentheses whenever the two names differ.
- On a Self-Managed cluster with several Physical Tenants, each environment is an independent target, with its own copy of the credential, its own values, and its own state. A credential deployed to one environment isn't readable from the other environments on that cluster.

**Note**
On Camunda 8 SaaS, Hub labels each target as a cluster. The **Environments only** tab is named **Clusters only**, and the wizard, the credential list, and the scan say _cluster_ wherever this page says _environment_. A SaaS cluster holds a single environment, so everything else on this page applies unchanged.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
