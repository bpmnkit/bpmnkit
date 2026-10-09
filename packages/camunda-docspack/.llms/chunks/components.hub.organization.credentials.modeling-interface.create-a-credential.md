# Configure credentials in the modeling interface — Create a credential

To create a credential from the properties panel:

1. Open the credential field, then select the option to create a new credential.
2. Enter a **Credential name**. Camunda Hub suggests a **Credential ID** based on the name.
3. Change the **Credential ID** if you want a different one. You cannot change it after the credential is created.
4. Fill in the fields for this credential type. For a sensitive field, enter a reference to a secret that already exists on the cluster, using `camunda.secrets.` followed by the secret key, such as `camunda.secrets.AWS_SECRET_KEY`. Select the field to pick from the secrets on the cluster behind the connected environment.
5. Save the credential. Camunda Hub creates it in the connected environment and selects it on the connector task.

Camunda Hub highlights a sensitive field and warns you when its value is not a secret reference. Saving is still allowed, so replace the value with a reference to keep the sensitive value in the secrets vault. For the reference syntax, see [reference a secret from a credential field](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index#reference-a-secret-from-a-credential-field).

Camunda Hub checks whether the secret you referenced exists on the cluster, without revealing its value. If the secret is missing, you see a warning, but you can still save the credential. The connector fails at runtime until the secret exists.

A value that embeds `camunda.secrets.` mid-word, such as `foo.camunda.secrets.AWS_SECRET_KEY`, holds no reference, so Camunda Hub reports it as plain text rather than as a missing secret. The plain-text warning replaces the missing secret warning on that field.

**Note**
You cannot create the secret itself here. Add the secret to the cluster first in [Connector secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets), then reference it from the credential.

A credential you create here is managed in Camunda Hub immediately. It appears on the **Managed in Hub** tab of the [**Credentials** page](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index#managed-credentials).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/modeling-interface
