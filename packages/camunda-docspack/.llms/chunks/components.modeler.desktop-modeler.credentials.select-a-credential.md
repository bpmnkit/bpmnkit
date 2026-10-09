# Use credentials — Select a credential

Connectors that support credentials show a credential field in the properties panel, such as **AWS Credential**. Select the field to open the credential chooser, which lists the credentials on the connected Camunda instance that match the credential type the connector needs.

Selecting a credential stores only a reference to it in your diagram. The credential's values stay on Camunda.

If no credential matches, the chooser tells you so by name, for example `Cannot find AWS Credential with name AWS_PROD`. This usually means the credential does not exist on the Camunda instance you are connected to, or it was created for a different credential type.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/credentials
