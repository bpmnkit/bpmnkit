# Manage credentials — Credentials and connector secrets — Store sensitive values as secrets, not plain text

Store every sensitive value, such as a password or API key, as a [secret](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) on the cluster, and reference it from the credential field. A credential field accepts any text you type, so a value entered directly is stored as you typed it, outside the secrets vault.

To guide you to a secret, Camunda Hub highlights a sensitive field and warns you when its value is not a secret reference. Saving is still allowed, so the value stays exposed until you replace it with a reference. The warning clears as soon as the field references a secret.

If the clusters that host the environments you selected hold no secrets yet, the field says so instead of showing an empty suggestion list. Secret suggestions are cluster-scoped, so every environment on a cluster offers that cluster's secret names.

In Camunda 8 SaaS, both messages carry an **Open Clusters** link that opens in a new tab, so your part-finished credential survives the detour. Self-Managed shows no link, because secrets come from the connector runtime configuration.

The same warning appears in the [modeling interface](https://docs.camunda.io/docs/next/components/hub/organization/credentials/modeling-interface#create-a-credential).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
