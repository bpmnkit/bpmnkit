# Use credentials — Create a credential

To create a credential from the properties panel:

1. Open the credential field, then select the option to create a new credential.
2. Enter a **Credential name**. Desktop Modeler suggests a **Credential ID** based on the name.
3. Change the **Credential ID** if you want a different one. You cannot change it after the credential is created.
4. Fill in the fields for this credential type. For a sensitive field, enter a reference to a secret that already exists on Camunda, using `camunda.secrets.` followed by the secret key, such as `camunda.secrets.AWS_SECRET_KEY`.
5. Save the credential. Desktop Modeler creates it on the connected Camunda instance and selects it on the connector task.

Desktop Modeler checks whether the secret you referenced exists on Camunda, without revealing its value. If the secret is missing, you see a warning, but you can still save the credential. The connector fails at runtime until the secret exists.

**Note**
Desktop Modeler cannot create the secret itself. Add the secret to the secret store first, then reference it from the credential.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/credentials
