# Data locations — Alerts

Camunda 8 [Alerts](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-alerts) can notify you when process instances stop with an error.

| Host location     | Data handled                                          | Personal data processing |
| :---------------- | :---------------------------------------------------- | :----------------------- |
| Germany, EU (AWS) | Route alerts containing administrative metadata only. | N/A                      |

**Note: optional**
Camunda 8 Alerts are optional. This information only applies if you use Alerts.


## Connector secrets (credentials)

This only applies if you want to create [connector secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) and are using the Camunda-hosted connector version. Connector secrets are configured and referenced via Camunda Hub.

- If you want to control the location where the secrets are stored, you can also [host your own connector runtime](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/host-custom-connector).
- If you want to use your own secret management solution, see [Secrets (Self‑Managed)](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration).

| Host location                                                                                                                                                                                                                                                                                                                                                                      | Data handled                                                                                        | Personal data processing                                                                                                                                                                                                                                         |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GCP Secret Manager, [replicated globally](https://cloud.google.com/secret-manager/docs/secret-manager-secrets-comparison) for high availability.From December 2025: Connector secrets for Camunda Orchestration Clusters >= 8.7 created in an AWS region will be stored inside AWS Secret Manager, in the same AWS region as the Camunda Orchestration Cluster only. | Stores credentials required by connectors (API keys, tokens, passwords), not business process data. | Not intended for personal data processing.If you embed personal data in connector secrets, note the global replication of data. You should review if your company has specific data residency requirements, and use connector secrets accordingly. |

**Note: optional**
Connector secrets are optional. This information only applies if you use connector secrets.

---
Source: https://docs.camunda.io/docs/next/components/saas/data-locations
