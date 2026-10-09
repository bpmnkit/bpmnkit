# Manage credentials — Manage credentials in Hub — Create a credential

To create a credential, select **Create credential**, and complete the three steps of the wizard.

1. **Choose credential**: select the credential type for the connector you want to authenticate. Each card describes the credential type and lists the connectors that use it. Use the search field to search by credential type or by connector name.

   ![Step 1 of the Create a credential wizard, showing a card for each credential type, such as AWS Credential, REST Authentication, and JDBC Connection, each listing the connectors that use it](./img/credentials-choose-credential.png)

2. **Configure**: name the credential, choose which environments it applies to, and fill in the fields for the credential type you selected.

   Camunda suggests an ID for the credential based on the name you enter. You can change the ID while you are creating the credential, but not afterwards. For a sensitive field, enter a reference to an existing secret, such as `camunda.secrets.AWS_SECRET_KEY`, rather than the value itself. Select the field to pick from the secrets that exist on the clusters that host the environments you selected.

   Camunda Hub highlights a sensitive field and warns you when its value is not a secret reference. **Continue** stays enabled, so replace the value with a reference before you save. See [store sensitive values as secrets, not plain text](#store-sensitive-values-as-secrets-not-plain-text).

   If you select more than one environment, keep **Use same credentials for all environments** enabled to apply one set of values everywhere, or disable it to configure each environment separately.

3. **Review**: check the summary, then select **Create** to save the credential and deploy it to the environments you selected.

You can also save the credential as a draft at any step. A draft is saved in Hub but is not deployed to any environment.

**Note**
You cannot create a secret while creating a credential. Add the secret to the cluster first in [Connector secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets), then reference it here. A credential's ID also cannot be changed after you create it, so to rename a credential, delete it and create a new one.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
