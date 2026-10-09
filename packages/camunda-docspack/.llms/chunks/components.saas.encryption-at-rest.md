# Encryption at rest

Camunda 8 SaaS cluster data at rest is protected using provider-managed or Camunda-managed encryption keys. AWS enterprise customers can bring their own AWS KMS key (BYOK) for full control.

Encryption at rest protects stored data by making it unreadable without the appropriate decryption keys.

By default, Camunda 8 SaaS uses a provider-managed encryption key with [Google Cloud Platform (GCP) encryption](https://cloud.google.com/docs/security/encryption/default-encryption). Enterprise customers can choose:

- Camunda-managed software or hardware keys (Google KMS)
- Bring Your Own Key (BYOK) on AWS for full control

Key points:

- Encryption type is selected only when [creating a cluster](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/create-cluster)
- Each cluster can have its own key
- The key applies to all workloads and persists across updates
- View encryption details on the cluster's **Overview** tab under **Cluster Details**

**Note**
Backups use default provider GCP encryption.

---
Source: https://docs.camunda.io/docs/next/components/saas/encryption-at-rest
